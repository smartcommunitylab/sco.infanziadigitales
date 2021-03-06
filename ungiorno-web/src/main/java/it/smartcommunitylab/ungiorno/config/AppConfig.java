/**
 * Copyright 2015 Fondazione Bruno Kessler - Trento RISE
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */

package it.smartcommunitylab.ungiorno.config;

import java.io.IOException;
import java.net.UnknownHostException;
import java.util.List;
import java.util.Properties;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.support.PropertySourcesPlaceholderConfigurer;
import org.springframework.core.io.Resource;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.TextIndexDefinition;
import org.springframework.data.mongodb.core.index.TextIndexDefinition.TextIndexDefinitionBuilder;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.util.AntPathMatcher;
import org.springframework.util.PathMatcher;
import org.springframework.web.filter.CharacterEncodingFilter;
import org.springframework.web.multipart.MultipartResolver;
import org.springframework.web.multipart.commons.CommonsMultipartResolver;
import org.springframework.web.servlet.ViewResolver;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;
import org.springframework.web.servlet.view.InternalResourceViewResolver;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.spring4.SpringTemplateEngine;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;
import org.thymeleaf.templateresolver.ITemplateResolver;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.google.common.base.Strings;
import com.mongodb.MongoClient;
import com.mongodb.MongoException;

import it.smartcommunitylab.ungiorno.controller.serializers.SchoolProfileJsonSerializer;
import it.smartcommunitylab.ungiorno.controller.serializers.TimeSlotServiceJsonDeserializer;
import it.smartcommunitylab.ungiorno.controller.serializers.TimeSlotServiceJsonSerializer;
import it.smartcommunitylab.ungiorno.diary.model.DiaryEntry;
import it.smartcommunitylab.ungiorno.model.SchoolProfile;
import it.smartcommunitylab.ungiorno.model.TimeSlotSchoolService;

@Configuration
@ComponentScan("it.smartcommunitylab.ungiorno")
@PropertySource("classpath:app.properties")
@EnableWebMvc
public class AppConfig extends WebMvcConfigurerAdapter {

    @Autowired
    @Value("${db.name}")
    private String dbName;

    @Value("${mail.smtp.host}")
    private String smtpHost;

    @Value("${mail.smtp.port}")
    private int smtpPort;

    @Value("${mail.smtp.username}")
    private String smtpUsername;

    @Value("${mail.smtp.password}")
    private String smtpPassword;

    @Value("classpath:/javamail.properties")
    private Resource javaMailProps;

    @Autowired
    public AppConfig() {}

    @PostConstruct
    public void createIndex() {
        try {
            TextIndexDefinition textIndex =
                    new TextIndexDefinitionBuilder().onField("text").build();
            getMongo().indexOps(DiaryEntry.class).ensureIndex(textIndex);
        } catch (Exception e) {
        }
    }

    @Bean
    public MongoTemplate getMongo() throws UnknownHostException, MongoException {
        return new MongoTemplate(new MongoClient(), dbName);
    }

    @Bean
    public JavaMailSender getJavaMailSender() throws IOException {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(smtpHost);
        mailSender.setPort(smtpPort);

        if (!Strings.isNullOrEmpty(smtpUsername)) {
            mailSender.setUsername(smtpUsername);
        }
        if (!Strings.isNullOrEmpty(smtpPassword)) {
            mailSender.setPassword(smtpPassword);
        }

        Properties mailProps = new Properties();
        mailProps.load(javaMailProps.getInputStream());

        mailSender.setJavaMailProperties(mailProps);

        return mailSender;
    }

    @Bean
    public ITemplateResolver templateResolver() {
        ClassLoaderTemplateResolver templateResolver = new ClassLoaderTemplateResolver();

        templateResolver.setTemplateMode("HTML");
        templateResolver.setCharacterEncoding("UTF-8");
        templateResolver.setOrder(1);
        return templateResolver;
    }

    @Bean
    public TemplateEngine templateEngine() {
        SpringTemplateEngine engine = new SpringTemplateEngine();
        engine.setTemplateResolver(templateResolver());
        return engine;
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

    /*
     * Override to use custom serializers and deserializers for model classes
     */
    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        converters.add(mappingJackson2HttpMessageConverter());
        super.configureMessageConverters(converters);
    }

    @Bean
    public MappingJackson2HttpMessageConverter mappingJackson2HttpMessageConverter() {
        Jackson2ObjectMapperBuilder objectMapperBuilder = new Jackson2ObjectMapperBuilder();
        objectMapperBuilder.deserializerByType(TimeSlotSchoolService.class,
                new TimeSlotServiceJsonDeserializer());

        objectMapperBuilder.serializerByType(SchoolProfile.class,
                new SchoolProfileJsonSerializer());
        objectMapperBuilder.serializerByType(TimeSlotSchoolService.class,
                new TimeSlotServiceJsonSerializer());

        ObjectMapper defaultMapper = objectMapperBuilder.build();
        defaultMapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
        MappingJackson2HttpMessageConverter jacksonConverter =
                new MappingJackson2HttpMessageConverter(defaultMapper);

        return jacksonConverter;
    }
    // @Bean
    // public WebContentInterceptor webContentInterceptor() {
    // WebContentInterceptor interceptor = new WebContentInterceptor();
    // interceptor.setCacheSeconds(0);
    // interceptor.setUseExpiresHeader(true);
    // interceptor.setUseCacheControlHeader(true);
    // interceptor.setUseCacheControlNoStore(true);
    // return interceptor;
    // }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/apps/**").addResourceLocations("/apps/");
        registry.addResourceHandler("/resources/*").addResourceLocations("/resources/");
        registry.addResourceHandler("/css/**").addResourceLocations("/resources/css/");
        registry.addResourceHandler("/fonts/**").addResourceLocations("/resources/fonts/");
        registry.addResourceHandler("/js/**").addResourceLocations("/resources/js/");
        registry.addResourceHandler("/lib/**").addResourceLocations("/resources/lib/");
        registry.addResourceHandler("/templates/**").addResourceLocations("/resources/templates/");
    }

    /**
     * Added this configuration to enable CORS requests for DEV purposes
     */

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**").allowedMethods("PUT", "DELETE", "GET", "POST");
    }

    @Bean
    public MultipartResolver multipartResolver() {
        return new CommonsMultipartResolver();
    }
    
    @Bean
    public PathMatcher pathMatcher() {

      AntPathMatcher pathMatcher = new AntPathMatcher();
      pathMatcher.setTrimTokens(false);
      return pathMatcher;
    }

    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {        
      configurer.setPathMatcher(pathMatcher());
    }
    
    @Bean 
    public CharacterEncodingFilter characterEncodingFilter() { 
        CharacterEncodingFilter filter = new CharacterEncodingFilter(); 
        filter.setEncoding("UTF-8"); 
        filter.setForceEncoding(true); 
        return filter; 
    } 

}
