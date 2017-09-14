/**
 *    Copyright 2015 Fondazione Bruno Kessler - Trento RISE
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

package it.smartcommunitylab.ungiorno.config;

import it.smartcommunitylab.ungiorno.diary.model.DiaryEntry;

import java.net.UnknownHostException;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.support.PropertySourcesPlaceholderConfigurer;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.TextIndexDefinition;
import org.springframework.data.mongodb.core.index.TextIndexDefinition.TextIndexDefinitionBuilder;
import org.springframework.web.multipart.MultipartResolver;
import org.springframework.web.multipart.commons.CommonsMultipartResolver;
import org.springframework.web.servlet.ViewResolver;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;
import org.springframework.web.servlet.view.InternalResourceViewResolver;

import com.mongodb.MongoClient;
import com.mongodb.MongoException;

@Configuration
@ComponentScan("it.smartcommunitylab.ungiorno")
//@PropertySource("classpath:app.properties")
@EnableWebMvc
public class AppConfig extends WebMvcConfigurerAdapter {

	@Autowired
	@Value("${db.name}")
	private String dbName;

	@Autowired
	public AppConfig() {
	}
	
	@PostConstruct
	public void createIndex() {
		try {
		TextIndexDefinition textIndex = new TextIndexDefinitionBuilder().onField("text").build();
		getMongo().indexOps(DiaryEntry.class).ensureIndex(textIndex);
		} catch (Exception e) {
		}
	}

	@Bean
	public MongoTemplate getMongo() throws UnknownHostException, MongoException {
		return new MongoTemplate(new MongoClient(), dbName);
	}

	@Bean
	public static PropertySourcesPlaceholderConfigurer propertySourcesPlaceholderConfigurer() {
		return new PropertySourcesPlaceholderConfigurer();
	}

	@Bean
	public ViewResolver getViewResolver() {
		InternalResourceViewResolver resolver = new InternalResourceViewResolver();
		resolver.setPrefix("/resources/");
		resolver.setSuffix(".html");
		return resolver;
	}
	
//	@Bean
//	public WebContentInterceptor webContentInterceptor() {
//		WebContentInterceptor interceptor = new WebContentInterceptor();
//		interceptor.setCacheSeconds(0);
//		interceptor.setUseExpiresHeader(true);
//		interceptor.setUseCacheControlHeader(true);
//		interceptor.setUseCacheControlNoStore(true);
//		return interceptor;
//	}

	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		registry.addResourceHandler("/apps/**").addResourceLocations(
				"/apps/");
		registry.addResourceHandler("/resources/*").addResourceLocations(
				"/resources/");
		registry.addResourceHandler("/css/**").addResourceLocations(
				"/resources/css/");
		registry.addResourceHandler("/fonts/**").addResourceLocations(
				"/resources/fonts/");
		registry.addResourceHandler("/js/**").addResourceLocations(
				"/resources/js/");
		registry.addResourceHandler("/lib/**").addResourceLocations(
				"/resources/lib/");
		registry.addResourceHandler("/templates/**").addResourceLocations(
				"/resources/templates/");
	}

	@Bean
	public MultipartResolver multipartResolver() {
		return new CommonsMultipartResolver();
	}
}
