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

package it.smartcommunitylab.ungiorno.controller;

import java.util.Collections;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.multipart.MultipartFile;

import it.smartcommunitylab.ungiorno.beans.ErrorDTO;
import it.smartcommunitylab.ungiorno.importer.ImportData;
import it.smartcommunitylab.ungiorno.importer.ImportError;
import it.smartcommunitylab.ungiorno.security.AppDetails;
import it.smartcommunitylab.ungiorno.services.RepositoryService;
import it.smartcommunitylab.ungiorno.storage.App;
import it.smartcommunitylab.ungiorno.usage.UsageManager;


@Controller
public class ConsoleController {
    private static final transient Logger logger = LoggerFactory.getLogger(ConsoleController.class);

    @Autowired
    private RepositoryService storage;

    @Autowired
    private UsageManager usageManager;

    @Autowired
    private ImportData importer;
    
    @RequestMapping(value = "/")
    public String root() {
        return "index";
    }

    @RequestMapping(value = "/login")
    public String login() {
        return "login";
    }

    @RequestMapping(value = "/console/data")
    public @ResponseBody App data() {
        return storage.getApp(getAppId());
    }

    
    /**
     * This is active import REST API
     * 
     * @param appId
     * @param file
     * @param request
     * @throws Exception
     */
    @RequestMapping(value = "/import", method = RequestMethod.POST)
    public @ResponseBody String uploadChildren(@RequestParam("schoolId") String schoolId,
            @RequestParam("file") MultipartFile file, HttpServletRequest request) throws Exception {
    	importer.importData(file.getInputStream(), getAppId(), StringUtils.isEmpty(schoolId) ? null : schoolId.trim());
    	return "{}";
    }
    
    @RequestMapping(value = "/downloadcsv", method = RequestMethod.POST)
    public void downloadCSV(HttpServletRequest req, HttpServletResponse resp) throws Exception {
        String res = "";
        String schoolId = req.getParameter("schoolId");
        String appId = getAppId();

        String result = usageManager.generateCSV(appId, schoolId);

        resp.setContentType("application/csv; charset=utf-8");
        resp.setHeader("Content-Disposition",
                "attachment; filename=\"usage_" + schoolId + ".csv\"");
        resp.getWriter().write(result);
    }

    private String getAppId() {
        AppDetails details =
                (AppDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String app = details.getUsername();
        return app;
    }

    @ExceptionHandler(ImportError.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ResponseBody
    public ErrorDTO handleImportError(HttpServletRequest request, Exception exception) {
    	ImportError e = (ImportError) exception;
       return new ErrorDTO("ImportError", 400, e.getValidationResults());
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    @ResponseBody
    public ErrorDTO handleError(HttpServletRequest request, Exception exception) {
        exception.printStackTrace();
        return new ErrorDTO("Exception", 500, Collections.<String>emptyList());
    }
}
