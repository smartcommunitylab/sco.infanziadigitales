package it.smartcommunitylab.ungiorno.utils;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public class JsonUtil {
	private static final transient Logger logger = LoggerFactory.getLogger(JsonUtil.class);
	public static final ObjectMapper mapper = new ObjectMapper();
	
	public static JsonNode readJsonFromString(String json) throws JsonParseException, JsonMappingException, IOException {
		return JsonUtil.mapper.readValue(json, JsonNode.class);
	}
	
	public static String convertObject(Object object) {
		try {
			String jsonInString = mapper.writeValueAsString(object);
			return jsonInString;
		} catch (JsonProcessingException e) {
			if(logger.isWarnEnabled()) {
				logger.warn(e.getMessage());
			}
		}
		return null;
	}
}
