let path = require('path')
global.rootPath = path.normalize(path.join(__dirname, '..', '..'))

module.exports = {
	
	// field_exporter config	
	field_node_public_id: '',
	field_nodes_multiple_ids: [],

	// address and port where the exporter will be bound
  bind_address: '127.0.0.1',
 	bind_port: 9337,
}
