// TODO: call api to add line notification for this product and user
import axios from "axios";

const backendUrl = `${process.env.REACT_APP_BACKEND_URL}/api/1.0`;


const addLineNotification = async (productId) => {
  const jwtToken = localStorage.getItem("jwtToken");
  if (!jwtToken) {
    alert("Please Sign in First");
    return;
  }

  const userData = await getUserProfile(jwtToken);

  if (!userData.isLineNotifyOn) {
    alert("Please turn on Line Notify in Profile Page");
    return;
  }

  const { data } = await axios.post(
    `${backendUrl}/line/notify/product/${productId}`, {}, {
    headers: { Authorization: "Bearer " + jwtToken },
  });

  return data;
}


async function getUserProfile(jwtToken) {
  try {
    const { data } = await axios.get(`${backendUrl}/user/profile`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
    });
    return data.data
  } catch (error) {
    console.error(error);
  }
}


export {
  addLineNotification
}