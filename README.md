# field_exporter
Prometheus Exporter for Carriota Field API metrics

## Latest Changes:

### April 3, 2018
* initial version published

## What does it do?

Works with [Prometheus](https://github.com/prometheus/prometheus) and [Grafana](https://grafana.com/) to export metrics from [Carriota Field APIs](http://field.carriota.com/) and pulls metrics from [Bitfinex's webservice API](https://docs.bitfinex.com/v2/docs) for required IOTA price data.

The following images are from my fieldstats4grafana dashboard. The top looks like this:

![top of dashboard](https://github.com/DaveRingelnatz/field_exporter/blob/master/images/field_exporter_top.png)

The next section contains season history data and data summaries of all my nodes:

![bottom of dashboard](https://github.com/DaveRingelnatz/field_exporter/blob/master/images/field_exporter_bottom.png)

I will work together with Nuriel Shem-Tov to include the field_exporter as soon as possible to IRI-Playbook.

## Current Metrics

* field_nodes_online
* field_season_balance
* field_season_score
* field_season_completed
* field_season_number_of_seasons
* field_node_rank
* field_node_score
* field_node_balance_iota
* field_node_balance_usd
* field_node_nr1_score
* field_node_season_participation
* field_node_season_workdonemax
* field_node_season_workdonemin
* field_node_season_workdonesum
* field_node_season_workdoneaverage
* field_multiple_nodes_score
* field_multiple_nodes_score_max
* field_multiple_nodes_score_min
* field_multiple_nodes_score_average
* field_multiple_nodes_number
* field_multiple_nodes_balance_iota
* field_multiple_nodes_balance_usd

## Dependencies

* Node JS: version >= 8.0 (due to async await use)
* Prometheus:  Here is a [great guide](https://www.digitalocean.com/community/tutorials/how-to-install-prometheus-on-ubuntu-16-04)
* Grafana: version >= 5.0

## Installation

```
git clone https://github.com/DaveRingelnatz/field_exporter.git
cd field_exporter
npm install
```

You need to configure the following values to use field_exporter in `config.js`:

* field_node_public_id (example entry: "field_node_public_id: 'yourpublicidhere',")
* field_nodes_multiple_ids (example config: "field_nodes_public_ids_array: ['publicId1','publicId2',")

The exporter is configured to run on port `9377` so as to comply with the list of [export default ports](https://github.com/prometheus/prometheus/wiki/Default-port-allocations)

Once installed and working you will then need to edit the Prometheus config file - `/etc/prometheus/prometheus.yml` and add a section like the below:

```
# field_exporter section
- job_name: 'field_exporter'
    scrape_interval: 30s
    static_configs:
      - targets: ['localhost:9377']
```
Please don't set the scrape_interval below `30s` value because this value already implies about ~3000 request per day to the carriota field APIs.

You need to restart the Prometheus service `sudo service prometheus restart` (or `sudo systemctl restart prometheus`) after adding an exporter.

Test by navigating to http://localhost:9337/metrics

## Grafana

Once the above is done, the metrics will be available to be consumed in a Grafana dashboard which must be added (see folder `dashboards`). 
