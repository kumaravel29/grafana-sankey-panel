FROM grafana/grafana:6.5.0

RUN grafana-cli plugins install grafana-worldmap-panel && \
    grafana-cli plugins install grafana-clock-panel && \
    grafana-cli plugins install grafana-piechart-panel && \
    grafana-cli plugins install jdbranham-diagram-panel && \
    grafana-cli plugins install vonage-status-panel && \
    grafana-cli plugins install btplc-trend-box-panel && \
    grafana-cli plugins install natel-discrete-panel && \
    grafana-cli plugins install digiapulssi-organisations-panel
COPY ./index.html /usr/share/grafana/public/views/index.html

#RUN cd /tmp && git clone https://github.com/GoshPosh/grafana-meta-queries.git && mv /tmp/grafana-meta-queries /var/lib/grafana/plugins/
RUN mkdir /var/lib/grafana/plugins/grafana-sankey-panel
COPY ./ /var/lib/grafana/plugins/grafana-sankey-panel/
