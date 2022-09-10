# ✏️ Repo rename
simple and easy to use CLI tool to rename your repository into a new case style. This makes it a smooth process to name all your repos in a single style.


## 💻 Usage
The best way is to use via ää`npx`, but you can also download it with `npm i repo-rename`

```
$ npx repo-rename -h

Options:
  -V, --version            output the version number
  -T, --token <token>      Your github personal access token (pat)
  -C, --case <case-style>  The case style to which the repositories should be renamed (default:
                           paramCase)
  -h, --help               display help for command
```


## 🔑 Personal Access token
To use this tool you need to [create a PAT](https://docs.github.com/en/enterprise-server@3.4/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token).

**The token doesn't need any scope!**


## 🔎 Available case styles
```
- camelCase
 => "testString"

- constantCase
 => "TEST_STRING"

- dotCase
 => "test.string"

- headerCase
 => "Test-String"

- paramCase
 => "test-string"

- pascalCase
 => "TestString"

- snakeCase
 => test_string
```


## 📌 Feature ideas
- Search repos to update links inside README's
- Update the local remotes of your repositories


## 📃 License
See [LICENSE](https://github.com/PsclDev/repo-rename/blob/master/LICENSE) file