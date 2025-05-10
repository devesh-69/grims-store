
import * as React from "react";
import { motion } from "framer-motion";
import { RefreshCcw, Settings } from "lucide-react";

const MaintenancePage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-8">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center mb-6">
            <motion.div 
              animate={{ 
                rotate: 360,
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
              className="relative w-32 h-32"
            >
              <Settings size={64} className="absolute inset-0 m-auto text-primary opacity-20" />
              <Settings size={32} className="absolute inset-0 m-auto text-primary" />
            </motion.div>
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">Site Maintenance</h1>
          <p className="text-muted-foreground mb-8">
            We're currently performing scheduled maintenance on our site. 
            We'll be back shortly!
          </p>
          
          <div className="relative pt-1 w-full mx-auto max-w-xs mb-8">
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-secondary/50">
              <motion.div 
                className="shadow-lg bg-primary flex flex-col text-center whitespace-nowrap text-white justify-center"
                initial={{ width: "0%" }}
                animate={{ 
                  width: ["0%", "100%", "0%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
            <div className="flex justify-center items-center text-sm text-muted-foreground">
              <RefreshCcw size={14} className="mr-1 animate-spin" />
              Processing updates...
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            If you're an administrator, you can <a href="/admin/settings" className="text-primary hover:underline">disable maintenance mode</a>.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default MaintenancePage;
