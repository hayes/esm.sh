package server

import (
	"errors"
	"fmt"
	"io/ioutil"
	"path"
	"strings"
	"sync"

	"github.com/evanw/esbuild/pkg/api"
	"github.com/ije/gox/utils"
)

var buildCache sync.Map
var loaders = map[string]api.Loader{
	".js":  api.LoaderJS,
	".jsx": api.LoaderJSX,
	".ts":  api.LoaderTS,
	".tsx": api.LoaderJSX,
}

type buildOptions struct {
	jsx    string
	target string
	minify bool
	cache  bool
	bundle bool
	origin string
}

func buildSync(filename string, source string, opts buildOptions) ([]byte, error) {
	if opts.cache {
		data, ok := buildCache.Load(filename)
		if ok {
			return data.([]byte), nil
		}
	}
	var resolverPlugin = api.Plugin{
		Name: "esm-resolver",
		Setup: func(build api.PluginBuild) {
			build.OnResolve(
				api.OnResolveOptions{Filter: ".*"},
				func(args api.OnResolveArgs) (api.OnResolveResult, error) {
					pathname, qs := utils.SplitByFirstByte(args.Path, '?')
					if args.Path == filename ||
						(strings.HasSuffix(filename, ".css") && strings.HasSuffix(args.Path, ".css")) ||
						(strings.HasSuffix(filename, "?css") && strings.HasSuffix(args.Path, "?css")) {
						return api.OnResolveResult{}, nil
					}
					if strings.HasSuffix(pathname, ".css") {
						pathname = pathname + "?module"
						if qs != "" {
							pathname += "&" + qs
						}
						return api.OnResolveResult{Path: pathname, External: true}, nil
					}
					if qs == "css" {
						pathname = pathname + "?css&module"
						return api.OnResolveResult{Path: pathname, External: true}, nil
					}
					if opts.bundle {
						if strings.HasPrefix(pathname, "http://") || strings.HasPrefix(pathname, "https://") {
							return api.OnResolveResult{
								Path:      pathname,
								Namespace: "http",
							}, nil
						}
						if strings.HasPrefix(pathname, "/") {
							return api.OnResolveResult{
								Path:      opts.origin + pathname,
								Namespace: "http",
							}, nil
						}
						return api.OnResolveResult{
							Path:      opts.origin + path.Join(path.Dir(filename), pathname),
							Namespace: "http",
						}, nil
					}
					return api.OnResolveResult{External: true}, nil
				},
			)
			build.OnLoad(
				api.OnLoadOptions{Filter: ".*", Namespace: "http"},
				func(args api.OnLoadArgs) (api.OnLoadResult, error) {
					resp, err := httpClient.Get(args.Path)
					if err != nil {
						return api.OnLoadResult{}, err
					}
					defer resp.Body.Close()
					if resp.StatusCode != 200 {
						return api.OnLoadResult{}, errors.New("bad gateway")
					}
					data, err := ioutil.ReadAll(resp.Body)
					if err != nil {
						return api.OnLoadResult{}, err
					}
					code := string(data)
					return api.OnLoadResult{
						Contents: &code,
						Loader:   loaders[path.Ext(filename)],
					}, nil
				})
		},
	}
	options := api.BuildOptions{
		Outdir:            "/esbuild",
		Write:             false,
		Bundle:            true,
		Target:            targets[opts.target],
		Format:            api.FormatESModule,
		Platform:          api.PlatformBrowser,
		JSXMode:           api.JSXModeTransform,
		MinifyWhitespace:  opts.minify,
		MinifyIdentifiers: opts.minify,
		MinifySyntax:      opts.minify,
		Plugins:           []api.Plugin{resolverPlugin},
	}
	options.Stdin = &api.StdinOptions{
		Sourcefile: filename,
		Loader:     loaders[path.Ext(filename)],
		Contents:   source,
	}
	if opts.jsx == "preact" {
		options.JSXFactory = "h"
		options.JSXFragment = "Fragment"
	}
	result := api.Build(options)
	if len(result.Errors) > 0 {
		log.Error(filename)
		return nil, fmt.Errorf(result.Errors[0].Text)
	}
	for _, file := range result.OutputFiles {
		if strings.HasSuffix(file.Path, ".js") {
			if opts.cache {
				buildCache.Store(filename, file.Contents)
			}
			return file.Contents, nil
		}
	}
	return nil, fmt.Errorf("JS not found")
}
