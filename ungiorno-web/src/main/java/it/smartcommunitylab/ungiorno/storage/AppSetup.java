package it.smartcommunitylab.ungiorno.storage;

import it.smartcommunitylab.ungiorno.model.AppInfo;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import org.yaml.snakeyaml.Yaml;
import org.yaml.snakeyaml.constructor.Constructor;

@Component
public class AppSetup {

	@Value("classpath:/apps-info.yml")
	private Resource resource;

	@Autowired
	private RepositoryManager storage;

	@PostConstruct
	public void init() throws IOException {
		Yaml yaml = new Yaml(new Constructor(AppSetup.class));
		AppSetup data = (AppSetup) yaml.load(resource.getInputStream());
		this.apps = data.apps;

		for (AppInfo cred: data.getApps()) {
			storage.createApp(cred);
		}
	}


	private List<AppInfo> apps;
	private Map<String,AppInfo> appsMap;

	public List<AppInfo> getApps() {
		return apps;
	}

	public void setApps(List<AppInfo> apps) {
		this.apps = apps;
	}

	@Override
	public String toString() {
		return "AppSetup [apps=" + apps + "]";
	}

	public AppInfo findAppById(String username) {
		if (appsMap == null) {
			appsMap = new HashMap<String, AppInfo>();
			for (AppInfo app : apps) {
				appsMap.put(app.getAppId(), app);
			}
		}
		return appsMap.get(username);
	}
}
