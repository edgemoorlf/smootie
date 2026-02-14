/**
 * Configuration Loader for Smootie
 * Loads and manages video set configurations from external JSON files
 *
 * @class ConfigLoader
 * @version 2.0.0
 */
class ConfigLoader {
    constructor() {
        this.config = null;
        this.loaded = false;
        this.loading = false;
        this.error = null;
    }

    /**
     * Load configuration from JSON file
     * @param {string} configPath - Path to configuration file
     * @returns {Promise<Object>} Configuration object
     */
    async loadConfig(configPath = '/config/videosets.json') {
        if (this.loading) {
            console.warn('Configuration is already loading');
            return this.waitForLoad();
        }

        if (this.loaded) {
            console.log('Configuration already loaded');
            return this.config;
        }

        this.loading = true;
        console.log(`Loading configuration from: ${configPath}`);

        try {
            const response = await fetch(configPath);

            if (!response.ok) {
                throw new Error(`Failed to load config: ${response.status} ${response.statusText}`);
            }

            this.config = await response.json();

            // Validate configuration
            this.validateConfig();

            this.loaded = true;
            this.loading = false;
            this.error = null;

            console.log('Configuration loaded successfully:', this.config);
            console.log(`Version: ${this.config.version}`);
            console.log(`Default set: ${this.config.defaultSet}`);
            console.log(`Available sets: ${Object.keys(this.config.sets).join(', ')}`);

            return this.config;
        } catch (error) {
            this.loading = false;
            this.error = error;
            console.error('Error loading configuration:', error);
            throw error;
        }
    }

    /**
     * Wait for configuration to finish loading
     * @returns {Promise<Object>} Configuration object
     */
    async waitForLoad() {
        return new Promise((resolve, reject) => {
            const checkInterval = setInterval(() => {
                if (this.loaded) {
                    clearInterval(checkInterval);
                    resolve(this.config);
                } else if (this.error) {
                    clearInterval(checkInterval);
                    reject(this.error);
                }
            }, 100);
        });
    }

    /**
     * Validate configuration structure
     * @throws {Error} If configuration is invalid
     */
    validateConfig() {
        if (!this.config) {
            throw new Error('Configuration is null');
        }

        if (!this.config.version) {
            throw new Error('Configuration version is missing');
        }

        if (!this.config.sets || typeof this.config.sets !== 'object') {
            throw new Error('Configuration sets is missing or invalid');
        }

        if (!this.config.defaultSet) {
            throw new Error('Configuration defaultSet is missing');
        }

        if (!this.config.sets[this.config.defaultSet]) {
            throw new Error(`Default set '${this.config.defaultSet}' not found in configuration`);
        }

        // Validate each video set
        for (const [setId, setConfig] of Object.entries(this.config.sets)) {
            this.validateVideoSet(setId, setConfig);
        }

        console.log('Configuration validation passed');
    }

    /**
     * Validate a single video set configuration
     * @param {string} setId - Video set ID
     * @param {Object} setConfig - Video set configuration
     * @throws {Error} If video set is invalid
     */
    validateVideoSet(setId, setConfig) {
        const required = ['id', 'name', 'videos', 'defaultVideo', 'idleVideo', 'commands', 'buttons'];

        for (const field of required) {
            if (!setConfig[field]) {
                throw new Error(`Video set '${setId}' is missing required field: ${field}`);
            }
        }

        if (!Array.isArray(setConfig.videos) || setConfig.videos.length === 0) {
            throw new Error(`Video set '${setId}' has no videos`);
        }

        // Validate defaultVideo exists
        const videoIds = setConfig.videos.map(v => v.id);
        if (!videoIds.includes(setConfig.defaultVideo)) {
            throw new Error(`Video set '${setId}' defaultVideo '${setConfig.defaultVideo}' not found in videos`);
        }

        // Validate idleVideo exists
        if (!videoIds.includes(setConfig.idleVideo)) {
            throw new Error(`Video set '${setId}' idleVideo '${setConfig.idleVideo}' not found in videos`);
        }

        // Validate at least one idle video
        const hasIdleVideo = setConfig.videos.some(v => v.isIdle);
        if (!hasIdleVideo) {
            console.warn(`Video set '${setId}' has no idle video (isIdle: true)`);
        }
    }

    /**
     * Get all video sets
     * @returns {Object} Video sets object
     */
    getVideoSets() {
        if (!this.loaded) {
            throw new Error('Configuration not loaded. Call loadConfig() first.');
        }
        return this.config.sets;
    }

    /**
     * Get default video set ID
     * @returns {string} Default video set ID
     */
    getDefaultSet() {
        if (!this.loaded) {
            throw new Error('Configuration not loaded. Call loadConfig() first.');
        }
        return this.config.defaultSet;
    }

    /**
     * Get a specific video set configuration
     * @param {string} setId - Video set ID
     * @returns {Object} Video set configuration
     */
    getVideoSet(setId) {
        if (!this.loaded) {
            throw new Error('Configuration not loaded. Call loadConfig() first.');
        }

        const setConfig = this.config.sets[setId];
        if (!setConfig) {
            throw new Error(`Video set '${setId}' not found`);
        }

        return setConfig;
    }

    /**
     * Get configuration version
     * @returns {string} Configuration version
     */
    getVersion() {
        if (!this.loaded) {
            throw new Error('Configuration not loaded. Call loadConfig() first.');
        }
        return this.config.version;
    }

    /**
     * Convert new configuration format to legacy format
     * Used for backward compatibility with existing code
     * @returns {Object} Legacy format configuration
     */
    convertToLegacyFormat() {
        if (!this.loaded) {
            throw new Error('Configuration not loaded. Call loadConfig() first.');
        }

        const legacy = {};

        for (const [setId, setConfig] of Object.entries(this.config.sets)) {
            legacy[setId] = {
                videos: setConfig.videos.map(v => v.id),
                defaultVideo: setConfig.defaultVideo,
                idleVideo: setConfig.idleVideo,
                commands: this.convertCommands(setConfig.commands),
                buttons: setConfig.buttons,
                audioAck: setConfig.audioAck || {
                    enabled: false,
                    volume: 0.7,
                    generic: [],
                    specific: {},
                    error: null
                },
                conversation: setConfig.conversation || null  // Include conversation config
            };
        }

        return legacy;
    }

    /**
     * Convert command configuration to legacy format
     * @param {Object} commands - Command configuration object
     * @returns {Object} Legacy command format (keyword -> video mapping)
     */
    convertCommands(commands) {
        const converted = {};

        for (const [cmdId, cmdConfig] of Object.entries(commands)) {
            // Map all keywords to the video
            for (const keyword of cmdConfig.keywords) {
                converted[keyword] = cmdConfig.video;
            }
        }

        return converted;
    }

    /**
     * Get video metadata by ID
     * @param {string} setId - Video set ID
     * @param {string} videoId - Video ID
     * @returns {Object} Video metadata
     */
    getVideoMetadata(setId, videoId) {
        const setConfig = this.getVideoSet(setId);
        const video = setConfig.videos.find(v => v.id === videoId);

        if (!video) {
            throw new Error(`Video '${videoId}' not found in set '${setId}'`);
        }

        return video;
    }

    /**
     * Get command metadata by keyword
     * @param {string} setId - Video set ID
     * @param {string} keyword - Command keyword
     * @returns {Object|null} Command metadata or null if not found
     */
    getCommandByKeyword(setId, keyword) {
        const setConfig = this.getVideoSet(setId);

        for (const [cmdId, cmdConfig] of Object.entries(setConfig.commands)) {
            if (cmdConfig.keywords.includes(keyword)) {
                return {
                    id: cmdId,
                    ...cmdConfig
                };
            }
        }

        return null;
    }

    /**
     * Check if configuration is loaded
     * @returns {boolean} True if loaded
     */
    isLoaded() {
        return this.loaded;
    }

    /**
     * Check if configuration is loading
     * @returns {boolean} True if loading
     */
    isLoading() {
        return this.loading;
    }

    /**
     * Get last error
     * @returns {Error|null} Last error or null
     */
    getError() {
        return this.error;
    }

    /**
     * Reload configuration
     * @param {string} configPath - Path to configuration file
     * @returns {Promise<Object>} Configuration object
     */
    async reload(configPath = '/config/videosets.json') {
        this.loaded = false;
        this.loading = false;
        this.config = null;
        this.error = null;

        console.log('Reloading configuration...');
        return this.loadConfig(configPath);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConfigLoader;
}
