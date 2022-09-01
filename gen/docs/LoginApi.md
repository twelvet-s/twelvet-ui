# LoginApi

All URIs are relative to *http://localhost:8000*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getFakeCaptcha**](LoginApi.md#getFakeCaptcha) | **POST** /api/login/captcha | 
[**login**](LoginApi.md#login) | **POST** /api/login/account | 
[**outLogin**](LoginApi.md#outLogin) | **POST** /api/login/outLogin | 


<a name="getFakeCaptcha"></a>
# **getFakeCaptcha**
> FakeCaptcha getFakeCaptcha(phone)



发送验证码

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.models.*;
import org.openapitools.client.api.LoginApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("http://localhost:8000");

    LoginApi apiInstance = new LoginApi(defaultClient);
    String phone = "phone_example"; // String | 手机号
    try {
      FakeCaptcha result = apiInstance.getFakeCaptcha(phone);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling LoginApi#getFakeCaptcha");
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
 **phone** | **String**| 手机号 | [optional]

### Return type

[**FakeCaptcha**](FakeCaptcha.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Success |  -  |

<a name="login"></a>
# **login**
> LoginResult login(body)



登录接口

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.models.*;
import org.openapitools.client.api.LoginApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("http://localhost:8000");

    LoginApi apiInstance = new LoginApi(defaultClient);
    LoginParams body = new LoginParams(); // LoginParams | 登录系统
    try {
      LoginResult result = apiInstance.login(body);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling LoginApi#login");
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
 **body** | [**LoginParams**](LoginParams.md)| 登录系统 |

### Return type

[**LoginResult**](LoginResult.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Success |  -  |
**401** | Error |  -  |

<a name="outLogin"></a>
# **outLogin**
> Object outLogin()



登录接口

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.models.*;
import org.openapitools.client.api.LoginApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("http://localhost:8000");

    LoginApi apiInstance = new LoginApi(defaultClient);
    try {
      Object result = apiInstance.outLogin();
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling LoginApi#outLogin");
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

