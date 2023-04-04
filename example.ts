import axiosMaster from "axios-master";
export default async (data: any) => {
  try {
    const result = await axiosMaster("name_", false, {
      method: "GET",
      url: encodeURI(``),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return Promise.resolve(result);
  } catch (error) {
    return Promise.reject(error);
  }
};
