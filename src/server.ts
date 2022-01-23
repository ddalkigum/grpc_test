import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { v4 as uuid } from 'uuid';

const PROTO_PATH = path.join(process.cwd(), '/src/customers.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  arrays: true,
})

const customersProto = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();

const customers = [
  {
    id: uuid(),
    name: 'Jun',
    age: 24,
    address: 'Address 1'
  },
  {
    id: uuid(),
    name: 'Bu',
    age: 40,
    address: 'Address 2' 
  },
  {
    id: uuid(),
    name: 'Bu',
    age: 40,
    address: 'Address 3' 
  }
]

const serv = customersProto.CustomerService as any

server.addService(serv.service, {
  getAll: (_: any, callback: any) => {
    callback(null, { customers })
  },

  get: (call: any, callback: any) => {
    const customer = customers.find(n => n.id = call.request.id);

    if (customer) {
      callback(null, customer);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: 'NotFound'
      })
    }
  },
  
  insert: (call: any, callback: any) => {
    const customer = call.request;

    customer.id = uuid();
    customers.push(customer);
    callback(null, customer);
  },

  remove: (call: any, callback: any) => {
    const existingCustomerIndex = customers.findIndex(
      n => n.id === call.request.id
    );

    if (existingCustomerIndex !== -1) {
      customers.splice(existingCustomerIndex, 1);
      callback(null, {})
    }
  }
});

server.bindAsync('127.0.0.1:3001', grpc.ServerCredentials.createInsecure(), () => {
  console.log('Server running');
  server.start();
});