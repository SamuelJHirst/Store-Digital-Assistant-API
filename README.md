# Store Digital Colleague API

A REST API for store management.

### About

This API was created to support a collection of retail tools that I intend to create in the near future. It is designed to serve as a backend to support applications in larger stores.

Some of its key features are:

- Getting information about products, such as their price and name.
- Getting and setting the quantities of a particular product at a store.
- Managing deliveries of stock between different sites.
- Managing customer profiles.
- Managing customer collections (more commonly known as Click & Collect).
- Assigning products to aisles and bays within a store.
- Creating groups of products which can be assigned in one go (modules).
- Keeping audit logs of key actions made by users.

### Setup

To set up the API, complete the following steps:

1. Clone the repository using `git@github.com:Naeviant/Store-Digital-Colleague-API.git`.
2. Install all dependencies using `npm install`.
3. Deploy a MongoDB Atlas Cluster by following this [guide](https://docs.atlas.mongodb.com/tutorial/deploy-free-tier-cluster).
4. Get your MongoDB connection string by following this [guide](https://docs.mongodb.com/guides/cloud/connectionstring/).
5. Build the project using `npm run build`.
6. Initialise the project using `npm run watch`.
7. When the `Successfully Connected to Database` message appears, use CTRL + C to stop execution.
8. Open the `counters` collection in the MongoDB Atlas Explorer by following [this guide](https://www.mongodb.com/blog/post/mongodb-atlas-data-explorer).
9. Configure the `.env` file.
	- `BASE` is the API base URL. You should probably leave this as is.
	- `PORT` is the localhost port which will be used. You should probably leave this as is. If you change it, make sure to change it in the `BASE` too.
	- `DB_URI` is your MongoDB connection string which you obtained in step 4.
	- `JWT_SECRET` is used for security. You should choose a long, randomised string.
	- `CUSTOMER_COUNTER` is the ObjectID of the record contained a `seq` value of 1000000000. For example, `5ff48327c8a2b0dc4ee1e748`.
	- `COLLECTION_COUNTER` is the ObjectID of the record contained a `seq` value of 2000000000. For example, `5ff48327c8a2b0dc4ee1e748`.
	- `DELIVERY_COUNTER` is the ObjectID of the record contained a `seq` value of 3000000000. For example, `5ff48327c8a2b0dc4ee1e748`.
10. Start the API using `npm run watch`.

### Documentation

Full documentation is available for this API [here](https://docs.api.sdc.hirst.xyz/).

### Contributing

Contributions to this project are very welcome!

All commits should be made to a branch you create, which can then be merged with a pull request. Please do not commit directly to the master branch.

Before making a pull request, please ensure that all tests pass. You should run the following commands to check that this is the case.

- `npm run build`
- `npm run lint`
- `npm run test`

### Support

If you have a problem or think that you have encountered a bug, please open an issue.

### License

> Copyright 2020, Sam Hirst

> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.