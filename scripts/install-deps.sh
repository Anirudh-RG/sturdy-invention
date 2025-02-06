set -e

echo "installing in root"
npm i

cd frontend && npm i 
echo "install done in frontend"
cd backend && npm i && cd ..
echo "install done in backend"

echo "installed all deps"