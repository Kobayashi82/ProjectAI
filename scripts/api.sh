#!/bin/bash

set -a
source .env
set +a

cp scripts/keys/${API_SSH_KEY} dashboard/api/privatekey
