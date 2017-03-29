/**
 * Created by keshen on 2016/11/4.
 */

import com.google.gson.*;
import com.google.gson.internal.LinkedTreeMap;
import com.google.gson.reflect.TypeToken;
import org.apache.velocity.app.Velocity;
import org.apache.velocity.Template;
import org.apache.velocity.context.Context;
import org.apache.velocity.VelocityContext;

import java.io.*;
import java.lang.reflect.Type;
import java.text.NumberFormat;
import java.util.*;
import java.net.URL;
import java.net.URLClassLoader;
import java.lang.reflect.Method;

public class Main {
    private static String inputPath;
    private static String outputPath;
    private static String specCaseId;
    private static boolean specCaseExists;
    private static List<String> testSuite;

    private static String readFile(String fileName) throws IOException {
        if (fileName == null) return "";
        BufferedReader br = new BufferedReader(new InputStreamReader(
                new FileInputStream(fileName), "UTF-8"));//new BufferedReader(new FileReader(fileName));
        StringBuilder sb = new StringBuilder("");
        String line;
        while ((line = br.readLine()) != null) {
            sb.append(line + "\n");
        }
        if (br != null) br.close();
        return sb.toString();
    }

    private static void getCaseNames() {
        String[] fileNameArr = {};
        File file = new File(inputPath);

        if (file.exists()) {
            fileNameArr = file.list();
        }

        testSuite = new ArrayList<String>();

        for (String s : fileNameArr) {
            if (!s.endsWith(".vm")) continue;
            if (specCaseId != null && (specCaseId + ".vm").equals(s)) {
                specCaseExists = true;
            }
            testSuite.add(s.substring(0, s.lastIndexOf(".vm")));
        }
    }

    public static class MapDeserializerDoubleAsIntFix implements JsonDeserializer<Object> {

        @Override
        @SuppressWarnings("unchecked")
        public Object deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context) throws JsonParseException {
            return (Object) read(json);
        }

        public Object read(JsonElement in) {

            if (in.isJsonArray()) {
                List<Object> list = new ArrayList<Object>();
                JsonArray arr = in.getAsJsonArray();
                for (JsonElement anArr : arr) {
                    list.add(read(anArr));
                }
                return list;
            } else if (in.isJsonObject()) {
                Map<String, Object> map = new LinkedTreeMap<String, Object>();
                JsonObject obj = in.getAsJsonObject();
                Set<Map.Entry<String, JsonElement>> entitySet = obj.entrySet();
                for (Map.Entry<String, JsonElement> entry : entitySet) {
                    map.put(entry.getKey(), read(entry.getValue()));
                }
                return map;
            } else if (in.isJsonPrimitive()) {
                JsonPrimitive prim = in.getAsJsonPrimitive();
                if (prim.isBoolean()) {
                    return prim.getAsBoolean();
                } else if (prim.isString()) {
                    return prim.getAsString();
                } else if (prim.isNumber()) {
                    Number num = prim.getAsNumber();
                    // here you can handle double int/long values
                    // and return any type you want
                    // this solution will transform 3.0 float to long values
                    if (Math.ceil(num.doubleValue()) == num.longValue())
                        return num.longValue();
                    else {
                        return num.doubleValue();
                    }
                }
            }
            return null;
        }
    }

    private static String runCase(String name) throws IOException {
        GsonBuilder builder = new GsonBuilder();
        builder.registerTypeAdapter(new TypeToken<Map<String, Object>>() {
        }.getType(), new MapDeserializerDoubleAsIntFix());
        Gson gson = builder.create();

        Map<String, Object> json = gson.fromJson(readFile(inputPath + "/" + name + ".json"), new TypeToken<Map<String, Object>>() {
        }.getType());
        Context context = new VelocityContext();
        for (String key : json.keySet()) {
            context.put(key, json.get(key));
        }

        Template template = Velocity.getTemplate(name + ".vm");

        Writer writer = new BufferedWriter(new OutputStreamWriter(
                new FileOutputStream(outputPath + "/" + name + ".html"), "UTF-8"));//new FileWriter(outputPath + "/" + name + ".html");
        template.merge(context, writer);
        writer.close();

        return readFile(outputPath + "/" + name + ".html");
    }

    public static void addPath(String s) throws Exception {
        File f = new File(s);
        URL u = f.toURI().toURL();
        URLClassLoader urlClassLoader = (URLClassLoader) ClassLoader.getSystemClassLoader();
        Class urlClass = URLClassLoader.class;
        Method method = urlClass.getDeclaredMethod("addURL", new Class[]{URL.class});
        method.setAccessible(true);
        method.invoke(urlClassLoader, new Object[]{u});
    }

    public static void main(String[] args) throws Exception {
        for (int i = 0, argLen = args.length; i < argLen; i++) {
            if (i == argLen - 1) break;
            if ("-i".equals(args[i])) {
                inputPath = args[i + 1];
            } else if ("-o".equals(args[i])) {
                outputPath = args[i + 1];
            } else if ("-n".equals(args[i])) {
                specCaseId = args[i + 1];
            }
        }

        // <!-- for test
//        inputPath = "D:\\programs\\sohu\\fe-static_new\\fe-static\\velocity\\test\\cases";
//        outputPath = "D:\\programs\\sohu\\fe-static_new\\fe-static\\velocity\\test\\java\\output";
//        specCaseId = "prop1";
        // -->

        if (inputPath == null || outputPath == null) {
            System.out.println("Please specify an input path, an output path (and a specified case name optionally).");
            return;
        }

        getCaseNames();

        addPath(inputPath);

        Properties p = new Properties();
        p.put("input.encoding", "utf-8");
        p.put("output.encoding", "utf-8");
        p.setProperty("resource.loader", "class");
        p.setProperty("class.resource.loader.class", "org.apache.velocity.runtime.resource.loader.ClasspathResourceLoader");
        Velocity.init(p);

        if (specCaseId != null) {
            if (!specCaseExists) {
                System.out.println("Case does not exist in " + inputPath);
            } else {
                System.out.println(runCase(specCaseId));
            }
            return;
        }

        for (String tc : testSuite) {
            System.out.println("running: " + tc);
            runCase(tc);
        }
    }
}
