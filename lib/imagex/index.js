/**
 * imagex
 * author: joeyguo
 * HomePage: https://github.com/gkajs/imagex
 * MIT Licensed.
 */

var path       = require("path"),
    color      = require("./color"),
    diff       = require("./diff"),
    split      = require("./split"),
    crop       = require("./crop"),
    unique     = require("./unique"),
    x2x        = require("./x2x"),
    images     = require("./images"),
    mini       = require("./mini"),
    file       = require("./file"), 
    info       = require("./info"), 
    writeFile  = file.writeFile,
    getFiles   = file.getFiles,
    deleteDir  = file.deleteDir;

var getData  = info.getData,
    getNames = info.getNames;

module.exports = function imagex(opt, callback) {

    var src       = opt.src,
        dest      = opt.dest,
        prefix    = opt.prefix,
        bgColor   = opt.bgColor,
        isSplit   = opt.isSplit,
        isDiff    = opt.isDiff,
        isCrop    = opt.isCrop,
        isUnique  = opt.isUnique,
        isSprites = opt.isSprites,
        spritesCount = opt.spritesCount,
        algorithm = opt.algorithm,
        isMini    = opt.isMini,
        isInfo    = opt.isInfo,
        isReplace = opt.isReplace;

    var tmpDir    = path.join(src, "..", ".tmpGKAdir");
    
    if (!src) {
        console.log();
        console.log('[error]: ' + 'imagex need dir !');
        console.log('----------------------------');
        return;
    }

    // MINI source image
    if (isReplace && isMini) {
        mini(src);
        return;
    }

    getFiles(src, (src2id) => {

        if(JSON.stringify(src2id) == "{}"){
            console.log('[error]: Can not find images');
            return;
        }

        split(isSplit, tmpDir, src2id, (src2id, src2splitInfo) => {

            color(bgColor, tmpDir, src2id, (src2id) => {

                diff(isDiff, tmpDir, src2id, (src2id) => {

                    crop(isCrop, tmpDir, src2id, (src2id, src2cutinfo) => {

                        unique(isUnique, src2id, (src2id) => {

                            var suffix = path.extname(Object.keys(src2id)[0]);

                            x2x(src2id, suffix, dest, prefix, isSprites, (src2distid, src2src, srcs, dists, src2dist) => {
                                
                                // output images
                                images(isSprites, {
                                    src2dist: src2dist,
                                    dists: dists,
                                    srcs: srcs,
                                    src2src: src2src,
                                    algorithm: algorithm,
                                    spritesFilepath: path.join(dest, (prefix? (prefix + "-"): "") + "sprites" + suffix),
                                    spritesCount: spritesCount,
                                }, (obj)=>{

                                    isMini && mini(dest);

                                    var data = getData({
                                        sprites: obj.sprites, 
                                        src2cutinfo: src2cutinfo, 
                                        src2dist: src2dist,
                                        src2splitInfo: src2splitInfo,
                                    });

                                    isInfo && writeFile(path.join(dest, "__info", "data.json"), JSON.stringify(data, null, '    '), () => {
                                        console.log(` ✔ __info data.json generated`);
                                    })

                                    callback && callback(data, {
                                    	getNames: getNames,
                                    });
                                    
                                    deleteDir(tmpDir);

                                });
                            });
                        });
                    });
                })
            })
        })

    });
}