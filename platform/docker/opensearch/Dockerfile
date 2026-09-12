ARG OPENSEARCH_VERSION=2.19.1
FROM opensearchproject/opensearch:${OPENSEARCH_VERSION}

RUN /usr/share/opensearch/bin/opensearch-plugin install --batch analysis-kuromoji \
  && /usr/share/opensearch/bin/opensearch-plugin install --batch ingest-attachment \
  && /usr/share/opensearch/bin/opensearch-plugin list | grep -q '^opensearch-knn$'
