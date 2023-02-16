# GitHub Action JSON

GitHub Action to read and write values from JSON files during workflow run.

## Features

- Read and write values from JSON files
- Fallback value if property is not set
- Override value if specific flag is set

## Usage

### Inputs

| Input                                        | Default        | Description                                                                                   |
|----------------------------------------------|----------------|-----------------------------------------------------------------------------------------------|
| `property`<span style="color:red">*</span>   | -              | Property to read or write.                                                                    |
| `file`                                       | `package.json` | Path to JSON file.                                                                            |
| `mode`                                       | `read`         | Mode of operation. Can be `read` or `write`.                                                  |
| `fallback`                                   | -              | Fallback value to use if property is not set.                                                 |
| `value`<span style="color:red">**</span>     | -              | Value to write to property.                                                                   |
| `valueType`                                  | `string`       | Value type to write to property. Valid types: `string`, `number`, `object`, `boolean`, `null` | 
| `useOverride`                                | `false`        | Use override value if property is set.                                                        |
| `override`<span style="color:red">***</span> | -              | Override value to use if property is set.                                                     |
| `noLog`                                      | `false`        | Do not log to console.                                                                        |

#### Legend

- <span style="color:red">*</span>: Required always
- <span style="color:red">**</span>: Required, if mode is `write`
- <span style="color:red">***</span>: Required, if `useOverride` is `true`

### Outputs

| Output  | Description       |
|---------|-------------------|
| `value` | Value of property |


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
        id: read-version
        with:
          property: version
          fallback: 1.0.0
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
        id: read-version
        with:
          property: version
          useOverride: ${{ github.ref == 'refs/heads/main' }}
          override: 1.0.0-${{ github.sha }}
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
        id: read-scripts-build
        with:
          property: scripts.build
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
        id: write-version
        with:
          mode: write
          property: version
          value: 1.0.0
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
        id: write-build-enabled
        with:
          mode: write
          file: test.json
          property: build.enabled
          value: true
          valueType: boolean  
```
