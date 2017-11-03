# after-dark

![after-dark screenshot](https://f.cloud.github.com/assets/98681/1831228/42af6c6a-7384-11e3-98fb-e0b923ee0468.png)

## Contents

- [Installation](#installation)
- [Options](#options)
  - [Top menu](#top-menu)
  - [Title](#title)

## Installation
First download this theme to your `themes` directory:

```bash
$ cd themes
$ git clone https://github.com/Keats/after-dark.git
```
and then enable it in your `config.toml`:

```toml
theme = "after-dark"
```

## Options

### Top-menu
Set a field in `extra` with a key of `after_dark_menu`:

```toml
after_dark_menu = [
    {url = "$BASE_URL", name = "Home"},
    {url = "$BASE_URL/categories", name = "Categories"},
    {url = "$BASE_URL/tags", name = "Tags"},
    {url = "https://google.com", name = "Google"},
]
```

If you put `$BASE_URL` in a url, it will automatically be replaced by the actual
site URL.

### Title
The site title is shown on the homepage. As it might be different from the `<title>`
element that the `title` field in the config represents, you can set the `after_dark_title`
instead.
