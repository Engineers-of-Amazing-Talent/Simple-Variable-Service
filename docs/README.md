# Simple Variable Service Endpoints

> **V1 - Unauthenticated Router: Deprecated**

## Creating a Variable

**Description**:  
Creates a New Variable with a single value.

### Request

**Method**: `POST`

**Endpoint**: `api/v1/variable`

**Headers**:

| Key            | Value           | Description                       |
| -------------- | --------------- | --------------------------------- |
| Content-Type   | application/json| The type of content being sent    |

**Request Body** :

```json
{
  "type": "STRING | INTEGER | FLOAT | BOOLEAN",
  "key": "variable name",
  "value": "corresponding value"
}
```

### Response

#### Success Response

**Code**: `201`

**Body**:

```json
{
  "resourceId": "Variable resource Id"
}
```

#### Error Response

**Code**: `400 Bad Request`

## Creating a List

**Description**:  
Creates a New Variable which holds onto a list of variables.

### Request

**Method**: `POST`

**Endpoint**: `api/v1/variable`

**Headers**:

| Key            | Value           | Description                       |
| -------------- | --------------- | --------------------------------- |
| Content-Type   | application/json| The type of content being sent    |

**Request Body** :

```json
{
  "type": "LIST",
  "key": "Name of List",
  "value": "meta data for list values"
}
```

### Response

#### Success Response

**Code**: `201`

**Body**:

```json
{
  "resourceId": "list ID"
}
```

## Creating a List Item

**Description**:  
Associates data with a list variable.

### Request

**Method**: `POST`

**Endpoint**: `api/v1/listItem`

**Headers**:

| Key            | Value           | Description                       |
| -------------- | --------------- | --------------------------------- |
| Content-Type   | application/json| The type of content being sent    |

**Request Body** :

```json
{
  "resourceId": "id of variable to be attached to a list",
  "listId": "id of list"
}
```

### Response

#### Success Response

**Code**: `201`

**Body**:

```json
{
  "resourceId": "list item ID"
}
```

#### Error Response

**Code**: `400 Bad Request`

## Fetching Variable Data

**Description**:  
Fetches Variable Data.

### Request

**Method**: `GET`

**Endpoint**: `api/v1/variable/{resourceId}`

**Path Parameters**:

| Parameter      | Type    | Description                          |
| -------------- | ------- | ------------------------------------ |
| resourceId     | UUID    | The unique identifier of the resource|

### Response

#### Success Response

**Code**: `200`

**Body**:

```json
{
  "data": "variable data"
}
```

#### Error Response

**Code**: `400 Bad Request`

## Updating a Variable

**Description**:  
Updates Variable Details.

### Request

**Method**: `PATCH`

**Endpoint**: `api/v1/variable/{resourceId}`

**Headers**:

| Key            | Value           | Description                       |
| -------------- | --------------- | --------------------------------- |
| Content-Type   | application/json| The type of content being sent    |

**Path Parameters**:

| Parameter      | Type    | Description                          |
| -------------- | ------- | ------------------------------------ |
| resourceId     | UUID    | The unique identifier of the resource|

**Request Body** :

```json
{
  "type": "updates type",
  "value": "updates value",
  "key": "updates variable name"
}
```

### Response

#### Success Response

**Code**: `200`

**Body**:

```json
{
  "data": "updated Variable data"
}
```

#### Error Response

**Code**: `400 Bad Request`

## Removing a Variable

**Description**:  
Deletes a Variable.

### Request

**Method**: `DELETE`

**Endpoint**: `api/v1/variable/{resourceId}`

**Path Parameters**:

| Parameter      | Type    | Description                          |
| -------------- | ------- | ------------------------------------ |
| resourceId     | UUID    | The unique identifier of the resource|

### Response

#### Success Response

**Code**: `204`

#### Error Response

**Code**: `400 Bad Request`
