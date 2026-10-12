# GitHub stacked pull requests

When a request mentions a PR stack or adding to a stack, use GitHub's Stacked Pull Requests feature. Check the current pull request's `stack` membership first. Create each new branch from the top pull request's branch, open the new pull request against that branch, and explicitly add the pull request to the GitHub stack with `gh stack` or the Stacks API. If the existing dependent pull requests have no GitHub stack, link them into one.

Before reporting completion, verify the new pull request's `stack` field names the expected stack and position. A parent branch as the base ref alone does not establish stack membership. Follow the current [GitHub stacked pull request documentation](https://docs.github.com/en/pull-requests/how-tos/stacked-pull-requests) for the available commands and API endpoints.
