// const fs = require('fs');
const axios = require('axios');
const { getAllUsersCollections } = require('../models/collections_model');
const { pool } = require('../models/mysqlcon');
const { API_URL } = process.env;

// const rl = require('readline/promises').createInterface({
//   input: process.stdin,
//   output: process.stdout
// });

async function getCollections(req, res) {
    // const user_id = await req.query.user_id;
    const user_collections = await getAllUsersCollections();

    const result = user_collections.reduce((acc, curr) => {
        const existingUser = acc.find((item) => item.user_id === curr.user_id);

        if (existingUser) {
            existingUser.product_id.push(curr.product_id);
        } else {
            acc.push({
                user_id: curr.user_id,
                product_id: [curr.product_id],
            });
        }
        return acc;
    }, []);

    // res.status(200).send(result);
    return result;
}

function transposeMatrix(matrix) {
    return matrix[0].map((col, c) => matrix.map((row, r) => matrix[r][c]));
}

// removes a specified index from a given array
function removeIndex(arr, i) {
    return arr.slice(0, i).concat(arr.slice(i + 1));
}

// returns the n nearest neighbours
function getNearestNeighbours(arr, n) {
    arr.sort((a, b) => {
        return b.correlation - a.correlation;
    });
    return arr
        .filter((x) => {
            return x.correlation > 0;
        })
        .slice(0, n);
}

// returns indices of array that match value
function getMatchingIndicies(arr, val) {
    var indicies = [];
    for (let i = 0; i < arr.length; i++) if (arr[i] == val) indicies.push(i);

    return indicies;
}

// returns the sets of items that both user a and b have rated
function getCommonSet(a, b) {
    let result = [];
    for (let i = 0; i < a.length; i++) {
        if (a[i] != -1 && b[i] != -1) result.push(i);
    }

    return result;
}

function mean(arr) {
    try {
        let filteredArr = arr.filter((x) => {
            return x != -1;
        });
        return filteredArr.reduce((a, b) => a + b) / filteredArr.length;
    } catch (e) {
        console.log({ error: 'there is no collection with user' });
    }
}

function getUserAverages(matrix) {
    let result = [];
    for (var i = 0; i < matrix.length; i++) result.push(mean(matrix[i]));
    return result;
}

function getSimilarity(item, items, userAverages) {
    let similarities = [];

    for (let i = 0; i < items.length; i++) {
        let commonSet = getCommonSet(item.ratings, items[i].ratings);

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let j = 0; j < commonSet.length; j++) {
            let ratingA = item.ratings[commonSet[j]] === -1 ? 0 : item.ratings[commonSet[j]]; // Treat -1 as 0
            let ratingB = items[i].ratings[commonSet[j]] === -1 ? 0 : items[i].ratings[commonSet[j]]; // Treat -1 as 0

            dotProduct += ratingA * ratingB;
            normA += ratingA * ratingA;
            normB += ratingB * ratingB;
        }

        // Avoid division by zero
        let similarity = normA !== 0 && normB !== 0 ? dotProduct / (Math.sqrt(normA) * Math.sqrt(normB)) : 0;

        similarities.push({ item: items[i].item, ratings: items[i].ratings, correlation: similarity });
    }

    return similarities;
}

function getPrediction(item, items) {
    let prediction = [...item.ratings];
    let unratedItems = getMatchingIndicies(prediction, -1);

    for (let i = 0; i < unratedItems.length; i++) {
        let numerator = 0;
        let denominator = 0;
        for (let j = 0; j < items.length; j++) {
            // Modify the calculation for binary ratings
            numerator += items[j].correlation * (items[j].ratings[unratedItems[i]] === 5 ? 1 : 0); // Assuming 5 is '喜歡'
            denominator += items[j].correlation;
        }

        // For binary ratings, consider rounding to the nearest integer (0 or 1)
        prediction[unratedItems[i]] = denominator !== 0 ? Math.round(numerator / denominator) : 0;
    }

    return prediction;
}

function findUserIndex(user_id, inputFile) {
    for (let i = 0; i < inputFile.length; i++) {
        if (inputFile[i].user_id === user_id) {
            return i;
        }
    }
    return -1;
}

async function getDefault() {
    const query = `
        WITH collections AS (
            SELECT product_id, COUNT(*) AS count
            FROM collections
            GROUP BY product_id
            ORDER BY count DESC
            LIMIT 6
        )
        
        SELECT oc.product_id, COUNT(*) AS count
        FROM collections oc
        JOIN order_table ot ON oc.product_id = JSON_VALUE(ot.details, '$.list[0].id')
        GROUP BY oc.product_id
        ORDER BY count DESC
        LIMIT 6;
    `;
    try {
        const [rows] = await pool.execute(query);
        console.log(rows);
        return rows.map((row) => row.product_id);
    } catch (error) {
        console.error(`Failed to get default recommendations: ${error}`);
    }
}

async function main() {
    try {
        let inputFile = await getCollections();
        const product_ids = [];

        let currentPage = 0;
        do {
            const response = await axios.get(`${API_URL}/api/1.0/products/all?paging=${currentPage}`);
            const currentPageProducts = response.data.data.map((product) => product.id);

            product_ids.push(...currentPageProducts);
            if (response.data.next_paging === undefined) {
                break;
            }
            currentPage++;
        } while (currentPage);

        const itemMatrix = product_ids.map((item) => ({
            item: item,
            ratings: Array.from({ length: inputFile.length }).fill(-1),
        }));

        inputFile.forEach((userCollection, userIndex) => {
            userCollection.product_id.forEach((likedProduct) => {
                const productIndex = product_ids.indexOf(likedProduct);
                if (productIndex !== -1) {
                    itemMatrix[productIndex].ratings[userIndex] = 5;
                }
            });
        });

        // console.log('itemMatrix', itemMatrix);
        const userMatrix = [];

        inputFile.forEach(({ user_id, product_id }) => {
            const userRow = Array(product_ids.length).fill(-1);

            product_id.forEach((id) => {
                const index = product_ids.indexOf(id);
                if (index !== -1) {
                    userRow[index] = 5;
                }
            });

            userMatrix.push(userRow);
        });
        // console.log('inputFile', inputFile);
        let neighbourhoodSize = 1;
        let completedMatrix = [];
        for (let i = 0; i < itemMatrix.length; i++) {
            if (itemMatrix[i].ratings.includes(-1)) {
                let similarity = getSimilarity(itemMatrix[i], removeIndex(itemMatrix, i), getUserAverages(userMatrix));
                let prediction = getPrediction(itemMatrix[i], getNearestNeighbours(similarity, neighbourhoodSize));
                completedMatrix.push(prediction);
                // console.log("similarity",similarity);
            } else {
                completedMatrix.push(itemMatrix[i].ratings);
            }
        }

        // // outputting completed matrix to console
        for (let x of transposeMatrix(completedMatrix)) console.log(...x);

        function getRecommendationsForUser(user_id, completedMatrix, product_ids) {
            const userIndex = findUserIndex(user_id, inputFile);

            if (userIndex === -1) {
                console.log(`Cannot find user_id  ${user_id}`);
                return [];
            }

            const userRow = completedMatrix.map((row) => row[userIndex]);

            const recommendedItems = userRow
                .map((rating, index) => ({ rating, item: product_ids[index] }))
                .filter((item) => item.rating === 1)
                .map((item) => item.item);

            while (recommendedItems.length < 5) {
                const unratedItemIndex = recommendedItems.length;
                const unratedItem = userRow
                    .map((rating, index) => ({ rating, item: product_ids[index] }))
                    .filter((item) => item.rating === 0)
                    .map((item) => item.item)[unratedItemIndex];

                if (unratedItem !== undefined) {
                    recommendedItems.push(unratedItem);
                } else {
                    break;
                }
            }

            return recommendedItems;
        }

        const allUserIds = inputFile.map((user) => user.user_id);
        allUserIds.forEach(async (userIdToRecommend) => {
            const recommendationsForUser = getRecommendationsForUser(userIdToRecommend, completedMatrix, product_ids);
            try {
                const promises = recommendationsForUser.map(async (item) => {
                    const query = `
                    INSERT IGNORE INTO recommendations (user_id, product_id)
                     VALUES (?, ?)`;
                    return pool
                        .execute(query, [userIdToRecommend, item])
                        .then((results) => {
                            console.log(`Insert into recommendations table successfully: user_id ${userIdToRecommend}, product_id ${item}`);
                        })
                        .catch((error) => {
                            console.error(`Failed inserting into recommendations table : ${error}`);
                            throw error;
                        });
                });

                await Promise.all(promises);
            } catch (error) {
                console.error(error);
            }
        });
    } catch (e) {
        console.log(e);
    }
}
try {
    async function runMain() {
        while (true) {
            await main();
            await new Promise((resolve) => setTimeout(resolve, 1000000));
        }
    }
    runMain();
} catch (error) {
    console.error('Failed to run main', error);
}

async function getRecommendations(req, res) {
    const user_id = req.query.userId;
    if (!user_id) {
        const defaultRecommendations = await getDefault();
        res.status(200).send({
            user_id,
            product_id: defaultRecommendations,
        });
        return;
    }
    const query = `
            SELECT *  FROM recommendations
            WHERE user_id = ?
        `;
    try {
        const [rows] = await pool.execute(query, [user_id]);
        const result = {
            user_id,
            product_id: rows.map((recommendation) => recommendation.product_id),
        };
        if (result.product_id.length === 0) {
            const defaultRecommendations = await getDefault();
            res.status(200).send({
                user_id,
                product_id: defaultRecommendations,
            });
        } else {
            res.status(200).send(result);
        }
    } catch (error) {
        console.error(`Failed to get recommendations: ${error}`);
    }
}

module.exports = {
    getRecommendations,
};
