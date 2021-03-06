const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');
const walkSync = require('walk-sync');
const Mustache = require('mustache');
const log = require('./x-log');
const utils = require('./x-utils');

function checkAndCreateDir() {
    let goalDirPath = path.resolve(process.cwd(), 'source')
    if (fs.existsSync(goalDirPath)) { } else {
        fs.mkdirSync(goalDirPath);
    }
}
let filesOpt = {
    init(options) {
        checkAndCreateDir();
        let isConfigExists;
        let about = path.resolve(process.cwd(), 'source/about.md');
        try {
            fs.accessSync(about);
            isConfigExists = true;
        } catch (e) {
            isConfigExists = false;
        }
        if (!isConfigExists) {
            let head = fs.readFileSync(path.join(__dirname, './tmpl/head.string'), 'utf-8');
            let tpl = Mustache.render(head, {
                data: {
                    title: 'about',
                    author: options.author,
                    site: options.site,
                    date: utils.formatDateNow()
                }
            });
            fs.writeFileSync(about, tpl, 'utf8');
        }
        return options;
    },
    clean(options) {
        fs.removeSync(path.resolve(process.cwd(), options.output_dir));
        return options;
    },
    create(options) {
        if (options.new) {
            checkAndCreateDir();
            let isConfigExists;
            let newInfo = path.resolve(process.cwd(), `source/${options.new}.md`);
            try {
                fs.accessSync(newInfo);
                isConfigExists = true;
            } catch (e) {
                isConfigExists = false;
            }
            if (!isConfigExists) {
                let head = fs.readFileSync(path.join(__dirname, './tmpl/head.string'), 'utf-8');
                let tpl = Mustache.render(head, {
                    data: {
                        title: options.new,
                        author: options.author,
                        site: options.site,
                        date: utils.formatDateNow()
                    }
                });
                fs.writeFileSync(newInfo, tpl, 'utf8');
                log.info(newInfo);
            } else {
                log.error('该文件已经存在了');
            }
        } else {
            log.error('请输入文件名字，使用xdocs -n xxx');
        }
        return options;
    },
    sources(options) {
        fs.copySync(path.resolve(process.cwd(), 'themes', 'default'), path.resolve(process.cwd(), options.output_dir), {
            filter(file) {
                return !/\.template$/.test(file);
            }
        });
        let source_from = path.resolve(process.cwd(), options.source_dir, 'sources');
        let source_to = path.resolve(process.cwd(), options.output_dir, 'sources');
        if (fs.existsSync(source_from)) {
            fs.copySync(source_from, source_to);
        }
        return options;
    },
    theme(options) {
        let theme_src = path.resolve(__dirname, '../../themes', options.theme, `layout`);
        let theme_dest = path.resolve(process.cwd(), 'themes', options.theme);
        if (!fs.existsSync(theme_dest)) {
            fs.copySync(theme_src, theme_dest);
        }
        const pageTemplate = fs.readFileSync(path.resolve(theme_dest, 'index.string'), 'utf8');
        options.templates = {
            index: pageTemplate
        };
        return options;
    }
}
module.exports = filesOpt;