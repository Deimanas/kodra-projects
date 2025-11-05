<?php
/*
Plugin Name: Kodra Projects Slider
Version: 1.1.7
*/
if(!defined('ABSPATH'))exit;class Kodra_Projects_Slider{public function __construct(){add_action('init',[$this,'register_cpt']);add_action('add_meta_boxes',[$this,'add_meta']);add_action('save_post',[$this,'save_meta']);add_shortcode('kodra_projektai_slider',[$this,'sc']);add_action('wp_enqueue_scripts',[$this,'assets']);}
public function register_cpt(){register_post_type('kodra_projektas',['labels'=>['name'=>'Projektai','singular_name'=>'Projektas'],'public'=>true,'show_in_rest'=>true,'supports'=>['title','thumbnail']]);}
public function add_meta(){add_meta_box('kodra_project_url','Svetainės nuoroda',[$this,'box'],'kodra_projektas');}
public function box($p){wp_nonce_field('kodra_save_project_url','kodra_project_url_nonce');$u=get_post_meta($p->ID,'_kodra_project_url',true);echo '<input type="url" name="kodra_project_url_field" value="'.esc_attr($u).'" style="width:100%" placeholder="https://...">';}
public function save_meta($id){if(!isset($_POST['kodra_project_url_nonce']))return;if(!wp_verify_nonce($_POST['kodra_project_url_nonce'],'kodra_save_project_url'))return;if(defined('DOING_AUTOSAVE')&&DOING_AUTOSAVE)return;if(isset($_POST['kodra_project_url_field']))update_post_meta($id,'_kodra_project_url',esc_url_raw($_POST['kodra_project_url_field']));}
public function assets(){wp_enqueue_style('kodra-css',plugins_url('assets/css/slider.css',__FILE__),[],'1.1.7');wp_enqueue_script('kodra-js',plugins_url('assets/js/slider.js',__FILE__),[],'1.1.7',true);}public function sc(){$q=new WP_Query(['post_type'=>'kodra_projektas','posts_per_page'=>-1,'post_status'=>'publish']);if(!$q->have_posts())return '<p>Projektų dar nėra.</p>';ob_start();?>
<div class='kodra-slider-wrap'><div class='kodra-slider'><div class='kodra-track'><?php while($q->have_posts()):$q->the_post();$t=get_the_title();$u=get_post_meta(get_the_ID(),'_kodra_project_url',true);$th=get_the_post_thumbnail_url(get_the_ID(),'large');?>
<div class='kodra-slide'><div class='card'><div class='title'><?php echo esc_html($t);?></div><div class='site-url'>www.<?php echo esc_html(parse_url($u,PHP_URL_HOST)?:'svetaine.lt');?></div><div class='thumb-wrap'><?php if($th):?><img src='<?php echo esc_url($th);?>' alt='<?php echo esc_attr($t);?>' loading='lazy'/><?php else:?><div class='no-thumb'>Nėra paveikslėlio</div><?php endif;?></div></div><?php if($u):?><a class='card-link' href='<?php echo esc_url($u);?>' target='_blank' rel='noopener'></a><?php endif;?></div>
<?php endwhile; wp_reset_postdata();?>
</div></div><div class='kodra-nav'><button class='kodra-prev' aria-label='Ankstesnis'>&#8592;</button><button class='kodra-next' aria-label='Kitas'>&#8594;</button></div></div>
<?php return ob_get_clean();}}
new Kodra_Projects_Slider();