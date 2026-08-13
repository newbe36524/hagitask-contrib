## add-repository command

Purpose: append repository entries in the order of one or more supplied URLs.

Steps:
1. Read and validate `.hagicode/monospecs.yaml` and its `repositories` array.
2. Extract one or more valid absolute URLs from the operation description.
3. Infer the repository name, relative `path`, and `displayName`; use default `icon` and `tags`. Stop and report when inference is unreliable.
4. Normalize paths and reject duplicates against existing entries or other inputs, missing fields, and invalid URLs without writing.
5. Append entries in URL input order and revalidate the complete document before writing.
6. Report each URL's inferred values, write path, validation result, and final repository count.
