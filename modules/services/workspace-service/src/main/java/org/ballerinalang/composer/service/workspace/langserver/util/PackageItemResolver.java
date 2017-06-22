package org.ballerinalang.composer.service.workspace.langserver.util;

import org.ballerinalang.composer.service.workspace.model.Connector;
import org.ballerinalang.composer.service.workspace.model.Function;
import org.ballerinalang.composer.service.workspace.model.ModelPackage;
import org.ballerinalang.composer.service.workspace.utils.BallerinaProgramContentProvider;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Class for resolving the items in a given package
 * Singleton instance
 */
public class PackageItemResolver {
    private final BallerinaProgramContentProvider ballerinaProgramContentProvider =
            BallerinaProgramContentProvider.getInstance();

    private static final PackageItemResolver instance = new PackageItemResolver();

    /**
     * Private constructor
     */
    private PackageItemResolver(){
    }

    /**
     * Get the singleton instance
     * @return {@link PackageItemResolver} singleton instance
     */
    public static PackageItemResolver getInstance() {
        return instance;
    }

    /**
     * Get the function invocations in the package
     * @param packageName - package name
     * @return {@link List} functions in the package
     */
    public List<Function> getFunctionInvocations(String packageName) {
        Map<String, ModelPackage> packages = this.ballerinaProgramContentProvider.getAllPackages();
        ModelPackage mPackage = null;
        for (Map.Entry<String, ModelPackage> entry : packages.entrySet()) {
            if (entry.getKey().contains(("." + packageName))) {
                mPackage = entry.getValue();
            }
        }
        if (mPackage != null) {
            return mPackage.getFunctions();
        } else {
            return new ArrayList<>();
        }
    }

    /**
     * Get the connectors in the package
     * @param packageName - package name
     * @return {@link List} connectors in the package
     */
    public List<Connector> getConnectors(String packageName) {
        ModelPackage mPackage = this.ballerinaProgramContentProvider.getAllPackages().get(packageName);
        return mPackage.getConnectors();
    }
}
