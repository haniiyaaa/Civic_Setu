const getPublicId = (url) => {

  const parts = url.split("/");

  const fileWithExtension = parts.pop(); 
  const folder = parts.pop();

  const fileName = fileWithExtension.split(".")[0];

  return `${folder}/${fileName}`;
};

export default getPublicId;