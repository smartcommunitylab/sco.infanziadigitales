## Prerequisites
* node v6 or higher with npm
* Install ionic CLI

```bash 
$ sudo npm install -g ionic cordova
```

## Configuration
1. Go to src/assets/conf
2. Modify env.json
```
{
    "env": "prod"
}
```
3. Copy config.default.json to config.prod.json
4. Modify config.prod.json with correct environment values

## Build for production

To product the production ready artifact run the command

```bash
$ ionic cordova build browser --prod --release
```

`www` folder will contain resulting final artifact

