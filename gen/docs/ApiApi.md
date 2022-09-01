# ApiApi

All URIs are relative to *http://localhost:8000*

Method | HTTP request | Description
------------- | ------------- | -------------
[**currentUser**](ApiApi.md#currentUser) | **GET** /api/currentUser | 
[**getNotices**](ApiApi.md#getNotices) | **GET** /api/notices | 


<a name="currentUser"></a>
# **currentUser**
> CurrentUser currentUser()



获取当前的用户

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.models.*;
import org.openapitools.client.api.ApiApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("http://localhost:8000");

    ApiApi apiInstance = new ApiApi(defaultClient);
    try {
      CurrentUser result = apiInstance.currentUser();
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling ApiApi#currentUser");
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

[**CurrentUser**](CurrentUser.md)

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

<a name="getNotices"></a>
# **getNotices**
> NoticeIconList getNotices()



### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.models.*;
import org.openapitools.client.api.ApiApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("http://localhost:8000");

    ApiApi apiInstance = new ApiApi(defaultClient);
    try {
      NoticeIconList result = apiInstance.getNotices();
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling ApiApi#getNotices");
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

[**NoticeIconList**](NoticeIconList.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Success |  -  |

