<?php
/**
 * Plugin Name: Kodra Projects Slider
 * Version: 1.1.11
 * GitHub Plugin URI: https://github.com/Deimanas/kodra-projects
 * Primary Branch: main
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Kodra_Projects_Slider {

    public function __construct() {
        add_action( 'init', [ $this, 'register_cpt' ] );
        add_action( 'add_meta_boxes', [ $this, 'add_meta' ] );
        add_action( 'save_post', [ $this, 'save_meta' ] );
        add_shortcode( 'kodra_projektai_slider', [ $this, 'sc' ] );
        add_action( 'wp_enqueue_scripts', [ $this, 'assets' ] );
    }

    public function register_cpt() {
        register_post_type(
            'kodra_projektas',
            [
                'labels'       => [
                    'name'          => 'Projektai',
                    'singular_name' => 'Projektas',
                ],
                'public'       => true,
                'show_in_rest' => true,
                'supports'     => [ 'title', 'thumbnail' ],
            ]
        );
    }

    public function add_meta() {
        add_meta_box( 'kodra_project_url', 'Svetainės nuoroda', [ $this, 'box' ], 'kodra_projektas' );
    }

    public function box( $post ) {
        wp_nonce_field( 'kodra_save_project_url', 'kodra_project_url_nonce' );

        $url = get_post_meta( $post->ID, '_kodra_project_url', true );

        echo '<input type="url" name="kodra_project_url_field" value="' . esc_attr( $url ) . '" style="width:100%" placeholder="https://...">';
    }

    public function save_meta( $post_id ) {
        if ( ! isset( $_POST['kodra_project_url_nonce'] ) ) {
            return;
        }

        if ( ! wp_verify_nonce( $_POST['kodra_project_url_nonce'], 'kodra_save_project_url' ) ) {
            return;
        }

        if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
            return;
        }

        if ( isset( $_POST['kodra_project_url_field'] ) ) {
            update_post_meta( $post_id, '_kodra_project_url', esc_url_raw( $_POST['kodra_project_url_field'] ) );
        }
    }

    public function assets() {
        wp_enqueue_style( 'kodra-css', plugins_url( 'assets/css/slider.css', __FILE__ ), [], '1.1.11' );
        wp_enqueue_script( 'kodra-js', plugins_url( 'assets/js/slider.js', __FILE__ ), [], '1.1.11', true );
    }

    public function sc() {
        $query = new WP_Query(
            [
                'post_type'      => 'kodra_projektas',
                'posts_per_page' => -1,
                'post_status'    => 'publish',
            ]
        );

        if ( ! $query->have_posts() ) {
            return '<p>Projektų dar nėra.</p>';
        }

        ob_start();
        ?>
        <div class="kodra-slider-wrap">
            <div class="kodra-slider">
                <div class="kodra-track">
                    <?php
                    while ( $query->have_posts() ) :
                        $query->the_post();

                        $title = get_the_title();
                        $url   = get_post_meta( get_the_ID(), '_kodra_project_url', true );
                        $thumb = get_the_post_thumbnail_url( get_the_ID(), 'large' );
                        $host  = $url ? parse_url( $url, PHP_URL_HOST ) : false;
                        ?>
                        <div class="kodra-slide">
                            <div class="card">
                                <div class="title">
                                    <?php echo esc_html( $title ); ?>
                                </div>
                                <div class="site-url">
                                    <?php if ( $url ) : ?>
                                        <a href="<?php echo esc_url( $url ); ?>" target="_blank" rel="noopener">
                                            www.<?php echo esc_html( $host ? $host : 'svetaine.lt' ); ?>
                                        </a>
                                    <?php else : ?>
                                        www.<?php echo esc_html( 'svetaine.lt' ); ?>
                                    <?php endif; ?>
                                </div>
                                <div class="thumb-wrap">
                                    <?php if ( $thumb ) : ?>
                                        <img src="<?php echo esc_url( $thumb ); ?>" alt="<?php echo esc_attr( $title ); ?>" loading="lazy" draggable="false" />
                                    <?php else : ?>
                                        <div class="no-thumb">Nėra paveikslėlio</div>
                                    <?php endif; ?>
                                </div>
                            </div>
                        </div>
                        <?php
                    endwhile;

                    wp_reset_postdata();
                    ?>
                </div>
            </div>
            <div class="kodra-nav">
                <button class="kodra-prev" aria-label="Ankstesnis">&#8592;</button>
                <button class="kodra-next" aria-label="Kitas">&#8594;</button>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
}

new Kodra_Projects_Slider();
