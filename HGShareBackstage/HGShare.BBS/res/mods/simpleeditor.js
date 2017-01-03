﻿/*
*简单编辑器
*
*/
layui.define(['layer','config'], function (exports) {
    var $ = layui.jquery,
        layer = layui.layer;
    var gather = {
        layEditor: function (options) {
        var html = '<div class="fly-edit">'
          +'<span type="face" title="插入表情"><i class="iconfont icon-biaoqing"></i>表情</span>'
          //+'<span type="picture" title="插入图片：img[src]"><i class="iconfont icon-tupian"></i>图片</span>'
          +'<span type="href" title="超链接格式：a(href)[text]"><i class="iconfont icon-lianjie"></i>链接</span>'
          +'<span type="code" title="插入代码"><i class="iconfont icon-daima"></i>代码</span>'
          +'<span type="yulan" title="预览"><i class="iconfont icon-yulan"></i>预览</span>'
        +'</div>';
        var mod = {
            //插入图片
            picture: function(editor){
                layer.open({
                    type: 1
                  ,id: 'fly-jie-upload'
                  ,title: '插入图片'
                  ,area: 'auto'
                  ,shade: false
                  ,area: '465px'
                  ,skin: 'layui-layer-border'
                  ,content: ['<ul class="layui-form layui-form-pane" style="margin: 20px;">'
                    ,'<li class="layui-form-item">'
                      ,'<label class="layui-form-label">URL</label>'
                      ,'<div class="layui-input-inline">'
                          ,'<input required name="image" placeholder="支持直接粘贴远程图片地址" value="" class="layui-input">'
                        ,'</div>'
                        ,'<input required type="file" name="file" class="layui-upload-file" value="">'
                    ,'</li>'
                    ,'<li class="layui-form-item" style="text-align: center;">'
                      ,'<button type="button" lay-submit lay-filter="uploadImages" class="layui-btn">确认</button>'
                    ,'</li>'
                  ,'</ul>'].join('')
                  ,success: function(layero, index){
                      var image =  layero.find('input[name="image"]');

                      layui.upload({
                          url: '/api/upload/'
                        ,elem: '#fly-jie-upload .layui-upload-file'
                        ,success: function(res){
                            if(res.status == 0){
                                image.val(res.url);
                            } else {
                                layer.msg(res.msg, {icon: 5});
                            }
                        }
                      });
              
                      form.on('submit(uploadImages)', function(data){
                          var field = data.field;
                          if(!field.image) return image.focus();
                          gather.focusInsert(editor[0], 'img['+ field.image + '] ');
                          layer.close(index);
                      });
                  }
                });
            }
            //表情
            ,face: function (editor, self) { //插入表情
                var str = '', ul, face = gather.faces;
              for(var key in face){
                  str += '<li title="'+ key +'"><img src="'+ face[key] +'"></li>';
              }
              str = '<ul id="LAY-editface" class="layui-clear">'+ str +'</ul>';
              layer.tips(str, self, {
                  tips: 3
                ,time: 0
                ,skin: 'layui-edit-face'
              });
              $(document).on('click', function(){
                  layer.closeAll('tips');
              });
              $('#LAY-editface li').on('click', function(){
                  var title = $(this).attr('title') + ' ';
                  gather.focusInsert(editor[0], 'face' + title);
              });
          }
            //链接
            ,href: function (editor) { //超链接
              layer.prompt({
                  title: '请输入合法链接'
                ,shade: false
              }, function(val, index, elem){
                  if(!/^http(s*):\/\/[\S]/.test(val)){
                      layer.tips('这根本不是个链接，不要骗我。', elem, {tips:1})
                      return;
                  }
                  gather.focusInsert(editor[0], ' a('+ val +')['+ val + '] ');
                  layer.close(index);
              });
          }
            //代码
            ,code: function (editor) { //插入代码
              layer.prompt({
                  title: '请贴入代码'
                ,formType: 2
                ,maxlength: 10000
                ,shade: false
              }, function(val, index, elem){
                  gather.focusInsert(editor[0], '[pre]\n'+ val + '\n[/pre]');
                  layer.close(index);
              });
            }
            //预览
            ,yulan: function(editor){ //预览
              var content = editor.val();
          
              content = /^\{html\}/.test(content) 
                ? content.replace(/^\{html\}/, '')
              : gather.content(content);

              layer.open({
                  type: 1
                ,title: '预览'
                ,area: ['100%', '100%']
                ,scrollbar: false
                ,content: '<div class="detail-body" style="margin:20px;">'+ content +'</div>'
              });
          }
        };
      
        layui.use('face', function(face){
            options = options || {};
            gather.faces = face;
            $(options.elem).each(function(index){
                var that = this, othis = $(that), parent = othis.parent();
                parent.prepend(html);
                parent.find('.fly-edit span').on('click', function(event){
                    var type = $(this).attr('type');
                    mod[type].call(that, othis, this);
                    if(type === 'face'){
                        event.stopPropagation()
                    }
                });
            });
        });
      
        }
        //输入并设置焦点
        ,focusInsert :function(obj, str){
                var result, val = obj.value;
                obj.focus();
                if(document.selection){ //ie
                    result = document.selection.createRange(); 
                    document.selection.empty(); 
                    result.text = str; 
                } else {
                    result = [val.substring(0, obj.selectionStart), str, val.substr(obj.selectionEnd)];
                    obj.focus();
                    obj.value = result.join('');
                }
            }
        //特殊字符转义
        ,escape: function(html){
            return String(html||'').replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
            .replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
        }
        //内容转义
        ,content: function(content){
            //支持的html标签
            var html = function(end){
                return new RegExp('\\['+ (end||'') +'(pre|div|table|thead|th|tbody|tr|td|ul|li|ol|li|dl|dt|dd|h2|h3|h4|h5)\\]\\n*', 'g');
            };
            content = gather.escape(content||'') //XSS
            .replace(/img\[([^\s]+?)\]/g, function(img){  //转义图片
                return '<img src="' + img.replace(/(^img\[)|(\]$)/g, '') + '">';
            }).replace(/@(\S+)(\s+?|$)/g, '@<a href="javascript:;" class="fly-aite">$1</a>$2') //转义@
            .replace(/face\[([^\s\[\]]+?)\]/g, function(face){  //转义表情
                var alt = face.replace(/^face/g, '');
                return '<img alt="'+ alt +'" title="'+ alt +'" src="' + gather.faces[alt] + '">';
            }).replace(/a\([\s\S]+?\)\[[\s\S]*?\]/g, function(str){ //转义链接
                var href = (str.match(/a\(([\s\S]+?)\)\[/)||[])[1];
                var text = (str.match(/\)\[([\s\S]*?)\]/)||[])[1];
                if(!href) return str;
                var rel =  /^(http(s)*:\/\/)\b(?!(\w+\.)*(sentsin.com|layui.com))\b/.test(href.replace(/\s/g, ''));
                return '<a href="'+ href +'" target="_blank"'+ (rel ? ' rel="nofollow"' : '') +'>'+ (text||href) +'</a>';
            }).replace(html(), '\<$1\>').replace(html('/'), '\</$1\>') //转移代码
            .replace(/\n/g, '<br>') //转义换行   
            return content;
        }
    }

    exports('simpleeditor', gather);
});