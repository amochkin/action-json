[![Tests](https://github.com/amochkin/action-json/actions/workflows/tests.yml/badge.svg)](https://github.com/amochkin/action-json/actions/workflows/tests.yml)

# GitHub Action JSON

GitHub Action to read and write values from JSON files during workflow run.

## Features

- Read and write values from JSON files
- Fallback value if property is not set
- Override value if specific flag is set

## Usage

### Inputs

| Input                                             | Default        | Description                                                                                   |
|---------------------------------------------------|----------------|-----------------------------------------------------------------------------------------------|
| `property`<span style="color:red">*</span>        | -              | Property to read or write. Example: `a.b.c`                                                   |
| `file`                                            | `package.json` | Path to JSON file relative to workspace.                                                      |
| `mode`                                            | `read`         | Mode of operation. Possible values: `read` or `write`.                                        |
| `fallback`                                        | -              | Fallback value to use if property is not set.                                                 |
| `value`<span style="color:red">**</span>          | -              | Value to write to property.                                                                   |
| `value_type`                                      | `string`       | Value type to write to property. Valid types: `string`, `number`, `object`, `boolean`, `null` | 
| `use_override`                                    | `false`        | Use override value if property is set.                                                        |
| `override_with`<span style="color:red">***</span> | -              | Override value to use if property is set.                                                     |
| `output_name`                                     | `value`        | Define output name for read value.                                                            |
| `output_file`                                     | `false`        | Do not log anything to console.                                                               |
| `quiet`                                           | `false`        | Do not log anything to console.                                                               |

#### Legend

- <span style="color:red">*</span>: Required always
- <span style="color:red">**</span>: Required, if mode is `write`
- <span style="color:red">***</span>: Required, if `useOverride` is `true`

### Outputs

| Output  | Description                                                              |
|---------|--------------------------------------------------------------------------|
| `value` | Value of property. Note: output name can be set with 'output_name' input |

## Examples

### Read value

#### 1. Read `version` property from `package.json` with fallback to `1.0.0`

```yaml
jobs:
  create-release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2
      
      - name: Read version from package.json with fallback
        uses: amochkin/action-json@v1
        id: read_version
        with:
          property: version
          fallback: 1.0.0
      - name: Output read value of 'version' property
        run: echo ${{ steps.read_version.outputs.value }}
        shell: bash
```

#### 2. Override `version` property from `package.json` if branch is `main`

```yaml
jobs:
  create-release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2
      
      - name: Read version from package.json with override
        uses: amochkin/action-json@v1
        id: read_version
        with:
          property: version
          use_override: ${{ github.ref == 'refs/heads/main' }}
          override_with: 1.0.0-${{ github.sha }}
      - name: Output read value of 'version' property
        run: echo ${{ steps.read_version.outputs.value }}
        shell: bash
```

#### 3. Read `scripts.build` property from `package.json`

```yaml
jobs:
  create-release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2
      
      - name: Read scripts.build from package.json
        uses: amochkin/action-json@v1
        id: read_scripts_build
        with:
          property: scripts.build
          
      - name: Output read value of 'scripts.build' property
        run: echo ${{ steps.read_scripts_build.outputs.value }}
        shell: bash
```

### Write value

### 1. Write `version` property to `package.json` with value `1.0.0`

```yaml
jobs:
  create-release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2
          
      - name: Write version to package.json
        uses: amochkin/action-json@v1
        id: write_version
        with:
          mode: write
          property: version
          value: 1.0.0
          
      - name: Output modified package.json
        run: cat package.json
        shell: bash 
```

### 2. Write `build.enabled` property to `test.json` with boolean value 

```yaml
jobs:
  create-release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2
          
      - name: Write build.enabled to test.json
        uses: amochkin/action-json@v1
        id: write_build_enabled
        with:
          mode: write
          file: test.json
          property: build.enabled
          value: true
          value_type: boolean
          
      - name: Output created (or overwritten) test.json
        run: cat test.json
        shell: bash
```
