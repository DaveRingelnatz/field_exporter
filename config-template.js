let path = require('path')
global.rootPath = path.normalize(path.join(__dirname, '..', '..'))

module.exports = {

    // field_exporter config
    // ALWAYS USE YOUR publicID, NOT YOUR FIELD NODE's NAME
    // example entry: field_node_public_id: 'yourpublicidhere',
    field_node_public_id: '',
    // example config: "field_nodes_public_ids_array: ['publicId1','publicId2'],"
    field_nodes_public_ids_array: [],

    // address and port where the exporter will be bound
    bind_address: '127.0.0.1',
    bind_port: 9337,
}
