export const getRequests = () => {
    return JSON.parse(localStorage.getItem("requests") || "[]");
  };
  
  export const addRequest = (request) => {
    const existing = getRequests();
    localStorage.setItem(
      "requests",
      JSON.stringify([...existing, request])
    );
  };
  
  export const updateRequests = (requests) => {
    localStorage.setItem("requests", JSON.stringify(requests));
  };