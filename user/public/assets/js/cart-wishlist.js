(function ($) {
    "use strict";

    var CART_URL = "add-to-cart.php";
    var WISHLIST_URL = "wish-list.php";

    function apiPost(url, data) {
        var formData = new FormData();
        Object.keys(data).forEach(function (key) {
            formData.append(key, data[key]);
        });

        return fetch(url, {
            method: "POST",
            body: formData,
            credentials: "same-origin"
        }).then(function (response) {
            if (!response.ok) {
                throw new Error("Request failed");
            }
            return response.json();
        });
    }

    function isReactManaged($el) {
        return $el.closest("[data-herbavi-react]").length > 0 || $el.closest(".herbavi-shop-card").length > 0;
    }

    function getItemId($el) {
        return $el.attr("data-id") || $el.data("id") || "";
    }

    function parsePrice(text) {
        var num = String(text || "")
            .replace(/[^\d.,]/g, "")
            .replace(",", "");
        return parseFloat(num) || 0;
    }

    function formatPrice(amount, display) {
        if (display && /[₹$€£]/.test(display)) {
            var symbol = display.match(/[₹$€£]/)[0];
            return symbol + amount.toFixed(2);
        }
        return amount.toLocaleString("en-US", { style: "currency", currency: "USD" });
    }

    function escapeAttr(str) {
        return String(str || "")
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    function extractProduct($card) {
        var $img = $card.find(".img-product").first();
        var src = $img.attr("src") || "";
        var name = $card.find(".name-product").first().text().trim();
        var priceText = $card.find(".price-new, .product-info__price").first().text().trim();
        var oldPriceText = $card.find(".price-old").first().text().trim();
        var url =
            $card.find(".name-product").first().attr("href") ||
            $card.find("a.product-img").first().attr("href") ||
            "#";

        return {
            id: src || name,
            name: name,
            price: parsePrice(priceText),
            priceDisplay: priceText,
            oldPrice: oldPriceText,
            image: src,
            url: url
        };
    }

    function getCartCount(cart) {
        return cart.reduce(function (sum, item) {
            return sum + (item.qty || 1);
        }, 0);
    }

    function updateCartBadgeFromCount(count) {
        var display = count > 0 ? String(count).padStart(2, "0") : "0";

        $(".nav-icon-item.shop-cart .number-order").text(count > 0 ? count : "0");
        $("#mobileMenu .nav-icon-item .number-order").text("(" + display + ")");
        $(".popup-shopping-cart .prd__count").text(display);
    }

    function updateWishlistBadgeFromCount(count) {
        var $badge = $(".nav-wishlist-count");

        if (!$badge.length) {
            return;
        }

        $badge.text(count);

        if (count > 0) {
            $badge.show();
        } else {
            $badge.hide();
        }
    }

    function updateWishlistIcon($wishlistLi, active) {
        var $link = $wishlistLi.find("a").first();
        var $icon = $link.find(".icon");
        var $tooltip = $link.find(".tooltip");

        if (active) {
            $wishlistLi.addClass("addwishlist");
            $icon.removeClass("icon-Hearth").addClass("icon-HearthFill");
            $tooltip.text("Remove Wishlist");
        } else {
            $wishlistLi.removeClass("addwishlist");
            $icon.removeClass("icon-HearthFill").addClass("icon-Hearth");
            $tooltip.text("Add to Wishlist");
        }
    }

    function syncWishlistIcons(ids) {
        $(".card-product").each(function () {
            var product = extractProduct($(this));
            if (!product.id) {
                return;
            }
            var $wishlist = $(this).find(".wishlist").first();
            if ($wishlist.length) {
                updateWishlistIcon($wishlist, ids.indexOf(product.id) !== -1);
            }
        });
    }

    function checkCartEmpty() {
        $(".wrap-empty_text").each(function () {
            var $listEmpty = $(this);
            var $textEmpty = $listEmpty.find(".box-text_empty");
            var $otherChildren = $listEmpty.find(".list-empty").children().not(".box-text_empty");
            var $boxEmpty = $listEmpty.find(".box-empty_clear");
            var $progress = $listEmpty.closest(".popup-shopping-cart").find(".tf-progress-bar .value");

            if ($otherChildren.length > 0) {
                $textEmpty.hide();
                $boxEmpty.show();
            } else {
                $textEmpty.show();
                $boxEmpty.hide();
                $(".tf-mini-cart-items").css("height", "100%");
                $progress.css("width", "0%");
            }
        });
    }

    function updateCartTotalFromCart(cart) {
        if ($(".popup-shopping-cart[data-herbavi-react]").length) {
            return;
        }

        var total = cart.reduce(function (sum, item) {
            return sum + item.price * (item.qty || 1);
        }, 0);

        var sampleDisplay = cart[0] && cart[0].priceDisplay;
        $(".tf-totals-total-value").text(formatPrice(total, sampleDisplay));
    }

    function renderCartItem(item) {
        var oldPriceHtml = item.oldPrice
            ? '<span class="price-old fw-normal cl-text-6">' + escapeAttr(item.oldPrice) + "</span>"
            : "";

        return (
            '<div class="tf-mini-cart-item file-delete" data-id="' +
            escapeAttr(item.id) +
            '">' +
            '<a href="' +
            escapeAttr(item.url) +
            '" class="tf-mini-cart-image">' +
            '<img loading="lazy" width="74" height="88" src="' +
            escapeAttr(item.image) +
            '" alt="' +
            escapeAttr(item.name) +
            '">' +
            "</a>" +
            '<div class="tf-mini-cart-info">' +
            '<a href="' +
            escapeAttr(item.url) +
            '" class="name fw-normal link-underline text-line-clamp-1">' +
            escapeAttr(item.name) +
            "</a>" +
            "</div>" +
            '<div class="tf-mini-cart-price">' +
            '<div class="price-wrap gap-6">' +
            '<span class="price-new fw-normal text-primary tf-mini-card-price">' +
            escapeAttr(item.priceDisplay) +
            "</span>" +
            oldPriceHtml +
            "</div>" +
            '<div class="group-action">' +
            '<div class="wg-quantity style-2">' +
            '<button type="button" class="btn-quantity minus-btn">' +
            '<i class="icon icon-Minus"></i>' +
            "</button>" +
            '<input class="quantity-product" type="text" name="number" value="' +
            (item.qty || 1) +
            '">' +
            '<button type="button" class="btn-quantity plus-btn">' +
            '<i class="icon icon-Plus"></i>' +
            "</button>" +
            "</div>" +
            '<button type="button" class="tf-btn-rounded style-2 remove">' +
            '<i class="icon icon-Trash"></i>' +
            "</button>" +
            "</div>" +
            "</div>" +
            "</div>"
        );
    }

    function renderCartFromData(cart) {
        var $container = $(".tf-mini-cart-items.list-empty");

        $container.find(".tf-mini-cart-item.file-delete").remove();

        cart.forEach(function (item) {
            $container.append(renderCartItem(item));
        });

        checkCartEmpty();
        updateCartTotalFromCart(cart);
        updateCartBadgeFromCount(getCartCount(cart));
    }

    function loadCart() {
        return apiPost(CART_URL, { action: "get" }).then(function (response) {
            if (response && response.success) {
                renderCartFromData(response.cart || []);
            }
            return response;
        }).catch(function () {
            return null;
        });
    }

    function loadWishlist() {
        return apiPost(WISHLIST_URL, { action: "get" }).then(function (response) {
            if (response.success) {
                updateWishlistBadgeFromCount(response.count || 0);
                syncWishlistIcons(response.ids || []);
            }
            return response;
        });
    }

    function addToCart(product) {
        if (!product.name) {
            return $.Deferred().reject().promise();
        }

        return apiPost(CART_URL, $.extend({ action: "add" }, product)).then(function (response) {
            if (response && response.success) {
                renderCartFromData(response.cart || []);
            }
            return response;
        }).catch(function () {
            return null;
        });
    }

    function updateCartItemQty(id, qty) {
        return apiPost(CART_URL, { action: "update", id: id, qty: qty }).then(function (response) {
            if (response.success) {
                renderCartFromData(response.cart || []);
            }
            return response;
        });
    }

    function removeFromCart(id) {
        return apiPost(CART_URL, { action: "remove", id: id }).then(function (response) {
            if (response.success) {
                renderCartFromData(response.cart || []);
            }
            return response;
        });
    }

    function toggleWishlist(product, $wishlistLi) {
        if (!product.name) {
            return $.Deferred().reject().promise();
        }

        return apiPost(WISHLIST_URL, $.extend({ action: "toggle" }, product)).then(function (response) {
            if (response.success) {
                updateWishlistBadgeFromCount(response.count || 0);
                updateWishlistIcon($wishlistLi, response.added === true);
                syncWishlistIcons(response.ids || []);
            }
            return response;
        });
    }

    function removeFromWishlistPage(id, $card) {
        return apiPost(WISHLIST_URL, { action: "remove", id: id }).then(function (response) {
            if (response.success) {
                $card.remove();
                updateWishlistBadgeFromCount(response.count || 0);
                syncWishlistIcons(response.ids || []);

                var count = response.count || 0;
                if (count === 0) {
                    $(".section-wishlist").hide();
                    $(".tf-wishlist-empty").show();
                    $(".number-order_wishlist").text("Nothing saved yet");
                } else {
                    $(".number-order_wishlist").text(count + " item" + (count === 1 ? "" : "s") + " saved");
                }
            }
            return response;
        });
    }

    function updateCartPageLineTotal($item) {
        var priceText = $item.find(".each-price").text().trim();
        var qty = parseInt($item.find(".quantity-product").val(), 10) || 1;
        var price = parsePrice(priceText);
        var lineTotal = formatPrice(price * qty, priceText);
        $item.find(".each-subtotal-price").text(lineTotal);

        var total = 0;
        $(".each-list-prd .each-prd").each(function () {
            total += parsePrice($(this).find(".each-subtotal-price").text());
        });
        $(".each-total-price").text(formatPrice(total, priceText));
    }

    function openCartPanel() {
        var el = document.getElementById("shoppingCart");
        if (el && typeof bootstrap !== "undefined") {
            bootstrap.Offcanvas.getOrCreateInstance(el).show();
        }
    }

    function bindEvents() {
        $(".card-product .wishlist").off("click");
        $(".wrapper-wishlist").off("click", ".card-product .remove");
        $(".each-list-prd .remove").off("click");

        $(document).on("click", ".card-product a[href='#shoppingCart']", function (e) {
            if (isReactManaged($(this))) {
                return;
            }
            e.preventDefault();
            addToCart(extractProduct($(this).closest(".card-product"))).then(function (response) {
                if (response && response.success) {
                    openCartPanel();
                }
            });
        });

        $(document).on("click", ".card-product .wishlist a", function (e) {
            if (isReactManaged($(this))) {
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(extractProduct($(this).closest(".card-product")), $(this).closest(".wishlist"));
        });

        $(document).on("click", ".wrapper-wishlist .product-action_remove.remove", function (e) {
            if (isReactManaged($(this))) {
                return;
            }
            e.preventDefault();
            var id = $(this).data("id") || $(this).closest(".card-product").data("id");
            removeFromWishlistPage(id, $(this).closest(".card-product"));
        });

        $(document).on("click", ".tf-mini-cart-items .remove", function (e) {
            if (isReactManaged($(this))) {
                return;
            }
            e.preventDefault();
            e.stopImmediatePropagation();
            removeFromCart(getItemId($(this).closest(".tf-mini-cart-item")));
        });

        $(document).on("click", ".tf-mini-cart-items .plus-btn", function (e) {
            if (isReactManaged($(this))) {
                return;
            }
            e.preventDefault();
            var $item = $(this).closest(".tf-mini-cart-item");
            var qty = parseInt($item.find(".quantity-product").val(), 10) + 1;
            $item.find(".quantity-product").val(qty);
            updateCartItemQty(getItemId($item), qty);
        });

        $(document).on("click", ".tf-mini-cart-items .minus-btn", function (e) {
            if (isReactManaged($(this))) {
                return;
            }
            e.preventDefault();
            var $item = $(this).closest(".tf-mini-cart-item");
            var qty = parseInt($item.find(".quantity-product").val(), 10);
            if (qty > 1) {
                qty -= 1;
                $item.find(".quantity-product").val(qty);
                updateCartItemQty(getItemId($item), qty);
            }
        });

        $(document).on("input", ".tf-mini-cart-items .quantity-product", function () {
            if (isReactManaged($(this))) {
                return;
            }
            var $item = $(this).closest(".tf-mini-cart-item");
            var qty = parseInt($(this).val(), 10) || 1;
            updateCartItemQty(getItemId($item), qty);
        });

        $(document).on("click", ".each-list-prd .remove, .each-list-prd .herbavi-cart-remove", function (e) {
            if (isReactManaged($(this))) {
                return;
            }
            e.preventDefault();
            e.stopImmediatePropagation();
            var $item = $(this).closest(".each-prd");
            removeFromCart(getItemId($item)).then(function () {
                $item.remove();
            });
        });

        $(document).on("click", ".each-list-prd .plus-quantity", function (e) {
            if (isReactManaged($(this))) {
                return;
            }
            e.preventDefault();
            var $item = $(this).closest(".each-prd");
            var qty = parseInt($item.find(".quantity-product").val(), 10) + 1;
            $item.find(".quantity-product").val(qty);
            updateCartItemQty(getItemId($item), qty).then(function () {
                updateCartPageLineTotal($item);
            });
        });

        $(document).on("click", ".each-list-prd .minus-quantity", function (e) {
            if (isReactManaged($(this))) {
                return;
            }
            e.preventDefault();
            var $item = $(this).closest(".each-prd");
            var qty = parseInt($item.find(".quantity-product").val(), 10);
            if (qty > 1) {
                qty -= 1;
                $item.find(".quantity-product").val(qty);
                updateCartItemQty(getItemId($item), qty).then(function () {
                    updateCartPageLineTotal($item);
                });
            }
        });
    }

    function init() {
        bindEvents();
        loadCart();
        loadWishlist();
    }

    $(init);
})(jQuery);
