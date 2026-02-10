# Web dyno: runs the API / dashboard
web: npm run start:web

# Worker dyno 1: runs shards 0 & 1
worker1: SHARD_IDS=0,1 npm run start:worker

# Worker dyno 2: runs shards 2 & 3
worker2: SHARD_IDS=2,3 npm run start:worker