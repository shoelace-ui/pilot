#!/usr/bin/env sh

# stylus -p $1

# cat raw.json

pilot --raw < $1 \
  | jq 'select(.[].isPrivate == false) ' \
  | jq -r '.[] | {
      name:    .ctx.name,
      type:    .ctx.type,
      receiver:.receiver,
      code:    .code,
      summary: .description.summary,
      body:    .description.body,
      tags:    .tags[],
      types:   .tags[].types[]
    }' 2>/dev/null \
  > data_public.json

cat data_public.json \
  | jq '.body' \
  | grep -E 'Examples' \
  | sort -u \
  | tr -s '\n' \
  | sed -E 's,## Examples:\\n,,' \
  | sed -E 's,\\n    ,\\n,g' \
  | awk '{
      name: .name,
      body: $bod
    }'

cat data_example.json

# pilot --raw < $1 \
#   | jq '.[]'

# cat data.json | jq .

# cat $1

# jade -O "$(cat data.json)" template.jade
