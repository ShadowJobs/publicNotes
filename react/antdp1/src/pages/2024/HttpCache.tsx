const URL = window.location.hostname === "localhost" ? "http://localhost:5002" : "/api-node-server"

const HttpCache: React.FC<{}> = ({ }) => {
  return <>
    <iframe src={URL} frameBorder={0} style={{ width: "100%", height: "100%" }}></iframe>
  </>
}

export default HttpCache