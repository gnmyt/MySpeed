# Setting up a Home Assistant sensor with MySpeed

## Configuring Sensor in Home Assistant

You need to manually add a sensor via YAML.

Update the **resource** adress and **scan_interval** (3600 seconds to check every hour) to match your setup.

### configuration.yaml
```yaml [configuration.yaml]
rest:
  - resource: "https://myspeed.myhome.local:5217/api/speedtests?limit=1"
    scan_interval: 3600
    verify_ssl: false
    sensor:
      - name: "Internet Download Speed"
        value_template: "{{ value_json[0].download }}"
        unit_of_measurement: "Mbps"
        device_class: data_rate
        
      - name: "Internet Upload Speed"
        value_template: "{{ value_json[0].upload }}"
        unit_of_measurement: "Mbps"
        device_class: data_rate
        
      - name: "Internet Ping"
        value_template: "{{ value_json[0].ping }}"
        unit_of_measurement: "ms"
        device_class: duration
```
## Cards to show your sensors

### ApexCharts Card

[ApexChars Card](https://github.com/RomRider/apexcharts-card) is a highly configurable Lovelace card that can show multiple series in the same chart.

You might need to change (or remove) the **max** values from the **yaxis** configuration.

```yaml
type: custom:apexcharts-card
graph_span: 24h
header:
  show: true
  title: Internet Speed
  show_states: true
  colorize_states: true
apex_config:
  legend:
    show: false
yaxis:
  - id: speed
    decimals: 0
    min: 0
    max: ~250
    apex_config:
      tickAmount: 5
  - id: ping
    opposite: true
    decimals: 1
    min: 0
    max: ~10
    apex_config:
      tickAmount: 5
series:
  - entity: sensor.internet_download_speed
    type: area
    name: Download
    yaxis_id: speed
    fill_raw: last
    float_precision: 0
    show:
      legend_value: false
  - entity: sensor.internet_upload_speed
    type: line
    name: Upload
    yaxis_id: speed
    fill_raw: last
    float_precision: 0
    show:
      legend_value: false
  - entity: sensor.internet_ping
    type: column
    name: Ping
    yaxis_id: ping
    fill_raw: last
    float_precision: 1
    show:
      legend_value: false
```
