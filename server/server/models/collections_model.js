const {pool} = require('./mysqlcon');

async function getAllUsersCollections() {
    try {
        const query = `
            SELECT collections.*
            FROM collections
        `;

        const [result] = await pool.execute(query);
        // pool.end(); 

        return result;
    } catch (error) {
        console.error("getAllUsersCollections error", error);
        throw error; // Rethrow the error to be handled by the caller
    }
}

module.exports = {
    getAllUsersCollections
}