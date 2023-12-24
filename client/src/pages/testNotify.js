import axios from "axios";

const handleNotify = () => {
  const clientId = process.env.REACT_APP_LINE_SERVICE_CLIENT_ID;
  const redirectUri = encodeURIComponent('http://localhost:3000/api/1.0/line/oauth/callback');
  const responseType = 'code';
  const scope = 'notify';

  const user = JSON.parse(localStorage.getItem("user"));
  const email = user.email;
  const state = email;
  const responseMode = 'form_post';

  // Construct the LINE authorization URL
  const authUrl = `https://notify-bot.line.me/oauth/authorize?response_type=${responseType}&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}&response_mode=${responseMode}`;

  // Redirect the user to the authorization URL
  window.location.href = authUrl;
}


const TestNotify = () => {
  // success: ?code=YIFxLTVabjpHuBCC4rncOe&state=NO_STATE
  // denied: ?error=access_denied&error_description=user+canceled&state=NO_STATE 
  return (
    <div className="w-full mx-auto">
      <div>
        TestNotify
      </div>
      <button onClick={handleNotify} className="border-2">
        Notify
      </button>
    </div>
  )
}
export default TestNotify