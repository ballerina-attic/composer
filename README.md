# Ballerina Composer

The Ballerina Composer provides a flexible and powerful browser-based tool for creating your Ballerina programs. You can build your integrations by creating sequence diagrams, dragging elements from a tool palette onto a canvas. As you build the diagrams, the underlying code is written for you, which you can work with in the Source view. You can also use the Swagger view to define services by writing Swagger definitions. You can switch seamlessly between the Design view, Source view, and Swagger view and create your programs in the way that you like to work. 

**You can create your integration in Design view:**

![alt text](./docs/images/DesignView.png?raw=true "Design view")


**And go to Source view to edit the code that's generated:**

![alt text](./docs/images/SourceView.png?raw=true "Source view")

**You can also go to Swagger view to edit the Swagger definition that's generated:**

![alt text](./docs/images/SwaggerView.png?raw=true "Source view")

## Running the Composer

The Composer is included in the full distribution of Ballerina, which you can download from www.ballerinalang.org. After you unzip it, navigate to its `bin` directory in the command line, and enter the following command:

```
composer
```

(On UNIX/Linux, enter `./composer` instead.)

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
export BALLERINA_HOME=/home/ballerina/server/ballerina-composer-<version>-SNAPSHOT
```