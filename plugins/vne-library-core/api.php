<?php
if (!defined('ABSPATH')) { exit; }
function vne_library_create_term($input) {
    if (!current_user_can('vne_manage_library')) { return vne_library_error('Không có quyền quản lý phân loại.',403); }
    if (!vne_library_keys($input,array('taxonomy','name','parent')) || !is_string($input['taxonomy']??null) || !isset(vne_library_taxonomies()[$input['taxonomy']]) || !is_string($input['name']??null) || !trim($input['name']) || strlen($input['name'])>200) { return vne_library_error('Phân loại không hợp lệ.'); }
    $parent=$input['parent']??0;
    if (!is_int($parent)||$parent<0||($parent&&($input['taxonomy']!=='vne_category'||!term_exists($parent,'vne_category')))) { return vne_library_error('Danh mục cha không hợp lệ.'); }
    return wp_insert_term(sanitize_text_field($input['name']),$input['taxonomy'],array('parent'=>$parent));
}
function vne_library_register_routes() {
    $namespace='vne-library/v1';
    register_rest_route($namespace,'/items',array(
        array('methods'=>'GET','permission_callback'=>'__return_true','callback'=>function($request){
            $edit=$request->get_param('context')==='edit';
            if($edit&&!vne_library_can_edit()){return vne_library_error('Không có quyền xem bản sửa.',403);}
            $type=$request->get_param('post_type')??'vne_resource';
            if(!is_string($type)||!isset(vne_library_types()[$type])){return vne_library_error('Loại nội dung không hợp lệ.');}
            $posts=get_posts(array('post_type'=>$type,'post_status'=>$edit?array('draft','publish','private'):'publish','numberposts'=>50,'orderby'=>'ID','order'=>'DESC'));
            return array_map(function($post)use($edit){return vne_library_item($post->ID,$edit);},$posts);
        }),
        array('methods'=>'POST','permission_callback'=>function(){return vne_library_can_edit();},'callback'=>function($request){
            $result=vne_library_save_item($request->get_json_params());
            return is_wp_error($result)?$result:new WP_REST_Response($result,201);
        })
    ));
    register_rest_route($namespace,'/items/(?P<id>\d+)',array(
        array('methods'=>'GET','permission_callback'=>'__return_true','callback'=>function($request){return vne_library_item((int)$request['id'],$request->get_param('context')==='edit');}),
        array('methods'=>'POST','permission_callback'=>function($request){return vne_library_can_edit((int)$request['id']);},'callback'=>function($request){return vne_library_save_item($request->get_json_params(),(int)$request['id']);})
    ));
    register_rest_route($namespace,'/terms',array('methods'=>'POST','permission_callback'=>function(){return vne_library_can_edit();},'callback'=>function($request){return vne_library_create_term($request->get_json_params());}));
}
