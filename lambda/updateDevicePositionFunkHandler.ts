exports.handler = async function (event: any, context: any) {
  console.log("event:", JSON.stringify(event, null, 2));
  console.log("context:", JSON.stringify(context, null, 2));
};
