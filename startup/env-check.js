var requiredVariables = {
  JANGLE_HOST: process.env.JANGLE_HOST,
  JANGLE_USER: process.env.JANGLE_USER,
  JANGLE_PASS: process.env.JANGLE_PASS
};

var missingVariables = [];

for(var property in requiredVariables)
{
  var value = requiredVariables[property];

  if(value === undefined)
  {
    missingVariables.push(property);
  }
}

if(missingVariables.length > 0)
{
  return console.error('Missing environment variables: ', missingVariables);
}
