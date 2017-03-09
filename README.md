# Ballerina Composer
[![Build Status](https://wso2.org/jenkins/job/ballerinalang/job/composer/badge/icon)](https://wso2.org/jenkins/job/ballerinalang/job/composer/)  [![Dependency Status](https://david-dm.org/ballerinalang/composer.svg)](https://david-dm.org/ballerinalang/composer)  [![devDependency Status](https://david-dm.org/ballerinalang/composer/dev-status.svg)](https://david-dm.org/ballerinalang/composer#info=devDependencies)  [![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)  
The Ballerina Composer provides a flexible and powerful browser-based tool for creating your Ballerina programs. You can build your integrations by creating sequence diagrams, dragging elements from a tool palette onto a canvas. As you build the diagrams, the underlying code is written for you, which you can work with in the Source view. You can also use the Swagger view to define services by writing Swagger definitions. You can switch seamlessly between the Design view, Source view, and Swagger view and create your programs in the way that you like to work.

**You can create your integration in Design view:**

![alt text](./docs/images/DesignView.png?raw=true "Design view")

**And go to Source view to edit the code that's generated:**

![alt text](./docs/images/SourceView.png?raw=true "Source view")

**You can also go to Swagger view to edit the Swagger definition that's generated:**

![alt text](./docs/images/SwaggerView.png?raw=true "Swagger view")

## How to build
The build process of the composer works on Maven and Node Package Manager(npm).

### Prerequisites
* JDK 1.8.0  
* [NPM](https://docs.npmjs.com/getting-started/installing-node) (Tested with 4.2.0)   
* Maven 3.0.5  

### Steps to build
* `mvn clean install` - To build the composer. You can find the distribution at `<BALLERINA_COMPOSER>/modules/distribution/target` folder.  

### Dev commands on web module(`<BALLERINA_COMPOSER>/modules/web`)
* `npm install` - Installs all npm dependencies.
* `npm run clean` - Deletes the `/dist`(distribution folder) in the web module.  
* `npm run build` or `npm run webpack` - To build the web module.  
* `npm run dev` - To start development server with hot deployment. Go to [http://localhost:8080](http://localhost:8080) or [http://127.0.0.1:8080](http://127.0.0.1:8080) afterwards.
* `npm run test` - Executes tests. The tests requires the composer service to run.    

## Running the Composer

The Composer is included in the full distribution of Ballerina, which you can download from www.ballerinalang.org. After you unzip it, navigate to its `/bin` directory in the command line, and enter the following command:

For Windows
```
composer.bat
```

For Unix/Linux
```
./composer
```

The command line will display the URL you can use to access the Composer in your browser.

For complete instructions on creating your integrations and using the Composer, see the [Ballerina documentation](http://ballerinalang.org/documentation/).


## Building from the source

If you want to build Ballerina Composer from the source code:

1. Get a clone or download the source from this repository (https://github.com/ballerinalang/composer).
1. Run the Maven command ``mvn clean install`` from the ``composer`` directory.
1. Extract the Ballerina Composer distribution created at `composer/modules/distribution/target/ballerina-composer-<version>-SNAPSHOT.zip` to your local directory.

**Note: Set BALLERINA_HOME to point a ballerina distribution before running the Composer for running the samples from the Composer itself.**

See an example on how to set ballerina home,
 ```
export BALLERINA_HOME=/home/ballerina/server/ballerina-<version>-SNAPSHOT
```