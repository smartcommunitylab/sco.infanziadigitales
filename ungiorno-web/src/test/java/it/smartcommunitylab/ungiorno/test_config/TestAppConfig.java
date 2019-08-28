package it.smartcommunitylab.ungiorno.test_config;

import java.net.UnknownHostException;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.support.PropertySourcesPlaceholderConfigurer;
import org.springframework.data.mongodb.core.MongoTemplate;

import com.mongodb.MongoClient;
import com.mongodb.MongoException;

import it.smartcommunitylab.ungiorno.config.AppConfig;

@Configuration
@ComponentScan(excludeFilters = {@ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE,
        classes = {FakeRepoManager.class})})
public class TestAppConfig extends AppConfig {

    private String dbName = "ungiorno-test";

    @Bean
    public static PropertySourcesPlaceholderConfigurer propertySourcesPlaceholderConfigurer() {
        return new PropertySourcesPlaceholderConfigurer();
    }

    @Bean
    public MongoTemplate getMongo() throws UnknownHostException, MongoException {
        return new MongoTemplate(new MongoClient(), dbName);
    }
}
