function validateRequiredFields(obj, requiredFields) {
  // console.log("🚀 ~ validateRequiredFields ~ obj:", obj)
  
  for (let field of requiredFields) {
    console.log("🚀 ~ validateRequiredFields ~ field:", field)
    if (
      !obj.hasOwnProperty(field) ||
      obj[field] === undefined ||
      obj[field] === null ||
      obj[field] === ""
    ) {
      return false;
    }
  }
  return true;
}

function validateRequiredFieldsArray(objs, requiredFields) {
  console.log("🚀 ~ validateRequiredFieldsArray ~ objs:", objs)
  
  for (let obj of objs) {
    if (!validateRequiredFields(obj, requiredFields)) {
      return false;
    }
  }
  return true;
}

module.exports = { validateRequiredFields, validateRequiredFieldsArray };
