db = db.getSiblingDB('learnbysign');
db.createUser({
  user: 'appuser',
  pwd: 'Str0ngPass!',
  roles: [{ role: 'readWrite', db: 'learnbysign' }]
});
