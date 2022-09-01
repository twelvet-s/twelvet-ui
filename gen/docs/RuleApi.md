# RuleApi

All URIs are relative to *http://localhost:8000*

Method | HTTP request | Description
------------- | ------------- | -------------
[**addRule**](RuleApi.md#addRule) | **POST** /api/rule | 
[**removeRule**](RuleApi.md#removeRule) | **DELETE** /api/rule | 
[**rule**](RuleApi.md#rule) | **GET** /api/rule | 
[**updateRule**](RuleApi.md#updateRule) | **PUT** /api/rule | 


<a name="addRule"></a>
# **addRule**
> RuleListItem addRule()



新建规则

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.models.*;
import org.openapitools.client.api.RuleApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("http://localhost:8000");

    RuleApi apiInstance = new RuleApi(defaultClient);
    try {
      RuleListItem result = apiInstance.addRule();
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling RuleApi#addRule");
      System.err.println("Status code: " + e.getCode());
      System.err.println("Reason: " + e.getResponseBody());
      System.err.println("Response headers: " + e.getResponseHeaders());
      e.printStackTrace();
    }
  }
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**RuleListItem**](RuleListItem.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Success |  -  |
**401** | Error |  -  |

<a name="removeRule"></a>
# **removeRule**
> Object removeRule()



删除规则

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.models.*;
import org.openapitools.client.api.RuleApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("http://localhost:8000");

    RuleApi apiInstance = new RuleApi(defaultClient);
    try {
      Object result = apiInstance.removeRule();
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling RuleApi#removeRule");
      System.err.println("Status code: " + e.getCode());
      System.err.println("Reason: " + e.getResponseBody());
      System.err.println("Response headers: " + e.getResponseHeaders());
      e.printStackTrace();
    }
  }
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

**Object**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Success |  -  |
**401** | Error |  -  |

<a name="rule"></a>
# **rule**
> RuleList rule(current, pageSize)



获取规则列表

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.models.*;
import org.openapitools.client.api.RuleApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("http://localhost:8000");

    RuleApi apiInstance = new RuleApi(defaultClient);
    BigDecimal current = new BigDecimal(78); // BigDecimal | 当前的页码
    BigDecimal pageSize = new BigDecimal(78); // BigDecimal | 页面的容量
    try {
      RuleList result = apiInstance.rule(current, pageSize);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling RuleApi#rule");
      System.err.println("Status code: " + e.getCode());
      System.err.println("Reason: " + e.getResponseBody());
      System.err.println("Response headers: " + e.getResponseHeaders());
      e.printStackTrace();
    }
  }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **current** | **BigDecimal**| 当前的页码 | [optional]
 **pageSize** | **BigDecimal**| 页面的容量 | [optional]

### Return type

[**RuleList**](RuleList.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Success |  -  |
**401** | Error |  -  |

<a name="updateRule"></a>
# **updateRule**
> RuleListItem updateRule()



新建规则

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.models.*;
import org.openapitools.client.api.RuleApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("http://localhost:8000");

    RuleApi apiInstance = new RuleApi(defaultClient);
    try {
      RuleListItem result = apiInstance.updateRule();
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling RuleApi#updateRule");
      System.err.println("Status code: " + e.getCode());
      System.err.println("Reason: " + e.getResponseBody());
      System.err.println("Response headers: " + e.getResponseHeaders());
      e.printStackTrace();
    }
  }
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**RuleListItem**](RuleListItem.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Success |  -  |
**401** | Error |  -  |

